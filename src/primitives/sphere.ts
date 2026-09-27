import { Primitive, PrimitiveKind } from './primitive';
import { defaultMaterial, type Material } from '~/materials';
import { Euler, euler } from '~/math/euler';
import { vec3, type Vector3 } from '~/math/vec3';

export type SphereOptions = {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  radius?: number;
  material?: Material;
};

export function sphere({
  position = vec3.zero(),
  rotation = euler.zero(),
  scale = vec3.one(),
  radius = 1,
  material = defaultMaterial,
}: SphereOptions = {}): Sphere {
  return new Sphere({ position, rotation, scale, radius, material });
}

export class Sphere {
  readonly primitive: Primitive;

  constructor(options: Required<SphereOptions>) {
    this.primitive = new Primitive({
      kind: PrimitiveKind.Sphere,
      position: options.position,
      rotation: options.rotation,
      scale: options.scale,
      bounds: vec3.fromScalar(options.radius),
      radius: 0,
      material: options.material,
    });
  }

  get material(): Material {
    return this.primitive.material;
  }

  get position(): Vector3 {
    return this.primitive.transform.position;
  }

  set position(position: Vector3) {
    this.primitive.transform.position.copy(position);
  }

  get rotation(): Euler {
    return this.primitive.transform.rotation;
  }

  set rotation(rotation: Euler) {
    this.primitive.transform.rotation.copy(rotation);
  }

  get scale(): Vector3 {
    return this.primitive.transform.scale;
  }

  set scale(scale: Vector3) {
    this.primitive.transform.scale.copy(scale);
  }

  get radius(): number {
    return this.primitive.bounds.x;
  }

  set radius(radius: number) {
    this.primitive.bounds.x = radius;
  }
}
