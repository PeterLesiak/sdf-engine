import { type Primitive, PrimitiveKind, PrimitiveStorage } from './primitive';
import { defaultMaterial } from '~/materials/default-material';
import type { Material } from '~/materials/material';
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

export class Plane implements Primitive {
  readonly storage: PrimitiveStorage;

  constructor(options: Required<PlaneOptions>) {
    this.storage = new PrimitiveStorage({
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
}
