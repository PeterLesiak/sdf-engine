struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vertex_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  const vertices = array(
    vec2f(-1, 3),
    vec2f(3, -1),
    vec2f(-1, -1),
  );

  var output: VertexOutput;
  output.position = vec4f(vertices[vertex_index], 0.0, 1.0);
  output.uv = vertices[vertex_index];

  return output;
}

struct Uniforms {
  camera_world: mat4x4f,
  resolution: vec2f,
  fov: f32, // radians
  elapsedTime: f32, // seconds,
  operations_count: u32,
  padding_1: u32,
  padding_2: u32,
  padding_3: u32,
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

struct Operation {
  kind: u32, // 0 = None, 1 = Union, 2 = Difference, 3 = Intersection, 4 = Smooth Union
  primitive_1: u32,
  primitive_2: u32,
  param: f32,
}

struct Primitive {
  inv_world: mat4x4f,
  bounds: vec4f, // Sphere (r, 0, 0, 0), Plane (0, 0, 0, 0), Box (hx, hy, hz, radius), Torus (R, r, 0, 0)
  kind: u32, // 0 = Sphere, 1 = Plane, 2 = Rounded Box, 3 = Torus
  material_id: u32,
}

struct Material {
  color: vec3f,
  padding: f32,
}

@group(1) @binding(0)
var<storage, read> operation_storage: array<Operation>;

@group(1) @binding(1)
var<storage, read> primitive_storage: array<Primitive>;

@group(1) @binding(2)
var<storage, read> material_storage: array<Material>;

fn sd_sphere(p: vec3f, center: vec3f, radius: f32) -> f32 {
  return length(p - center) - radius;
}

fn sd_plane(p: vec3f, point_on_plane: vec3f, normal: vec3f) -> f32 {
  return dot(p - point_on_plane, normalize(normal));
}

fn sd_round_box(p: vec3f, center: vec3f, half_extents: vec3f, radius: f32) -> f32 {
  let q = abs(p - center) - half_extents + vec3f(radius);
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0) - radius;
}

fn sd_torus(p: vec3f, R: f32, r: f32) -> f32 {
  let q = vec2f(length(p.xz) - R, p.y);
  return length(q) - r;
}

struct Surface {
  dist: f32,
  color: vec3f,
}

fn op_union(s1: Surface, s2: Surface) -> Surface {
  if (s1.dist < s2.dist) {
    return s1;
  }

  return s2;
}

fn op_difference(s1: Surface, s2: Surface) -> Surface {
  var surface: Surface;
  surface.dist = max(-s1.dist, s2.dist);
  surface.color = s2.color;

  return surface;
}

fn op_intersection(s1: Surface, s2: Surface) -> Surface {
  if (s1.dist > s2.dist) {
    return s1;
  }

  return s2;
}

fn op_smooth_union(s1: Surface, s2: Surface, k: f32) -> Surface {
  let h = clamp(0.5 + 0.5 * (s2.dist - s1.dist) / k, 0.0, 1.0);
  let h_color = smoothstep(0.0, 1.0, h);

  var surface: Surface;
  surface.dist = mix(s2.dist, s1.dist, h) - k * h * (1.0 - h);
  surface.color = mix(s2.color, s1.color, h_color);
  
  return surface;
}

const ray_distance_threshold = 10000f;
const ray_marching_steps = 1000i;
const ray_marching_epsilon = 0.0001f;
const ray_marching_threshold = 100f;

fn get_primitive_surface(world_point: vec3f, index: u32) -> Surface {
  let primitive = primitive_storage[index];
  let p_local = (primitive.inv_world * vec4f(world_point, 1.0)).xyz;

  var dist = ray_distance_threshold;
  
  switch primitive.kind {
    case 0u: {
      dist = sd_sphere(
        p_local,
        vec3f(0),
        primitive.bounds.x,
      );
    }

    case 1u: {
      dist = sd_plane(
        p_local,
        vec3f(0),
        vec3f(0, 1, 0),
      );
    }

    case 2u: {
      dist = sd_round_box(
        p_local,
        vec3f(0),
        primitive.bounds.xyz,
        primitive.bounds.w
      );
    }

    case 3u: {
      dist = sd_torus(
        p_local,
        primitive.bounds.x,
        primitive.bounds.y,
      );
    }

    default: {}
  }
  
  let material = material_storage[primitive.material_id];

  var surface: Surface;
  surface.dist = dist;
  surface.color = material.color;

  return surface;
}

fn map_scene(point: vec3f) -> Surface {
  var min_surface = Surface(ray_distance_threshold, vec3f(0));

  for (var i = 0u; i < uniforms.operations_count; i++) {
    let operation = operation_storage[i];
    
    let s1 = get_primitive_surface(point, operation.primitive_1);
    let s2 = get_primitive_surface(point, operation.primitive_2);

    var surface = min_surface;

    switch operation.kind {
      case 0u, default: { surface = s1; }

      case 1u: { surface = op_union(s1, s2); }
      case 2u: { surface = op_difference(s1, s2); } 
      case 3u: { surface = op_intersection(s1, s2); }
      case 4u: { surface = op_smooth_union(s1, s2, operation.param); }
    }

    min_surface = op_union(min_surface, surface);
  }

  return min_surface;
}

fn get_normal(p: vec3f) -> vec3f {
  let e = vec2f(0.001, 0.0);

  let n = vec3f(
    map_scene(p + e.xyy).dist - map_scene(p - e.xyy).dist,
    map_scene(p + e.yxy).dist - map_scene(p - e.yxy).dist,
    map_scene(p + e.yyx).dist - map_scene(p - e.yyx).dist,
  );

  return normalize(n);
}

struct Ray {
  origin: vec3f,
  dir: vec3f,
}

fn get_camera_ray(uv: vec2f) -> Ray {
  let focal_length = 1.0 / tan(uniforms.fov / 2.0);

  var aspect_uv = uv;
  aspect_uv.x *= uniforms.resolution.x / uniforms.resolution.y;

  let ray_dir_view = normalize(vec3f(aspect_uv, -focal_length));

  let ray_origin = uniforms.camera_world[3].xyz;
  let ray_dir = normalize((uniforms.camera_world * vec4f(ray_dir_view, 0.0)).xyz);

  return Ray(ray_origin, ray_dir);
}

fn get_sky_color(rd: vec3f, sun_dir: vec3f) -> vec3f {
  let zenith_color = vec3f(0, 0.1, 0.6);
  let horizon_color = vec3f(0.2, 0.3, 0.45);

  let sky_factor = max(rd.y, 0.0);
  let sky = mix(horizon_color, zenith_color, pow(sky_factor, 0.4));

  let sun_dot = max(dot(rd, sun_dir), 0.0);
  let sun_halo = pow(sun_dot, 32.0) * vec3f(1.0, 0.7, 0.4) * 0.8;
  let sun_disk = pow(sun_dot, 2048.0) * vec3f(12.0, 10.0, 8.0);

  return sky + sun_halo + sun_disk;
}

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
  let ray = get_camera_ray(input.uv);

  var dO: f32 = 0.0;
  var hit: bool = false;

  for (var i = 0; i < ray_marching_steps; i++) {
    let point = ray.origin + ray.dir * dO;

    let surface = map_scene(point);
    let dS = surface.dist;

    dO += dS;

    if (dS < ray_marching_epsilon) {
      hit = true;
      break;
    }

    if (dO > ray_distance_threshold) {
      break;
    }
  }

  let light_angle = (uniforms.elapsedTime + 100) * -0.00005;
  // let light_dir = normalize(vec3f(sin(light_angle), 0.2, cos(light_angle)));
  let light_dir = normalize(vec3f(0.5, 0.8, 0.6));

  // let sun_dir = light_dir;
  let sun_dir = normalize(vec3f(0.27, 0.2, -0.5));
  let sky_color = get_sky_color(ray.dir, sun_dir);

  var col = sky_color;

  if (hit) {
    let point = ray.origin + ray.dir * dO;
    let normal = get_normal(point);
    let hit_surface = map_scene(point);

    let diffuse = max(dot(normal, light_dir), 0.0);
    
    let sky_light = max(normal.y, 0.0) * vec3f(0.1, 0.15, 0.25);
    let sun_light = diffuse * vec3f(1.0, 0.9, 0.8);

    let surface_color = hit_surface.color * (sun_light + sky_light + 0.05);

    let fog_density = 0.0005;
    let fog_factor = 1.0 - exp(-dO * fog_density);
    
    col = mix(surface_color, sky_color, fog_factor);
  }

  col = col / (col + vec3f(1.0)); 
  col = pow(col, vec3f(1.0 / 2.2));

  return vec4f(col, 1.0);
}
