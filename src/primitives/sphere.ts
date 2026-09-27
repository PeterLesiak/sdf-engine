import { type Primitive, PrimitiveKind, PrimitiveStorage } from './primitive';
import { defaultMaterial } from '~/materials/default-material';
import type { Material } from '~/materials/material';
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

export class Sphere implements Primitive {
  readonly storage: PrimitiveStorage;

  constructor(options: Required<SphereOptions>) {
    this.storage = new PrimitiveStorage({
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
    return this.storage.material;
  }

  get position(): Vector3 {
    return this.storage.transform.position;
  }

  set position(position: Vector3) {
    this.storage.transform.position.copy(position);
  }

  get rotation(): Euler {
    return this.storage.transform.rotation;
  }

  set rotation(rotation: Euler) {
    this.storage.transform.rotation.copy(rotation);
  }

  get scale(): Vector3 {
    return this.storage.transform.scale;
  }

  set scale(scale: Vector3) {
    this.storage.transform.scale.copy(scale);
  }

  get radius(): number {
    return this.storage.bounds.x;
  }

  set radius(radius: number) {
    this.storage.bounds.x = radius;
  }
}
