import { Primitive, PrimitiveKind } from './primitive';
import { defaultMaterial, type Material } from '~/materials';
import { euler, type Euler } from '~/math/euler';
import { vec3, type Vector3 } from '~/math/vec3';

export type PlaneOptions = {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  material?: Material;
};

export function plane({
  position = vec3.zero(),
  rotation = euler.zero(),
  scale = vec3.one(),
  material = defaultMaterial,
}: PlaneOptions = {}): Plane {
  return new Plane({ position, rotation, scale, material });
}

export class Plane {
  readonly primitive: Primitive;

  constructor(options: Required<PlaneOptions>) {
    this.primitive = new Primitive({
      kind: PrimitiveKind.Plane,
      position: options.position,
      rotation: options.rotation,
      scale: options.scale,
      bounds: vec3.zero(),
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
}
