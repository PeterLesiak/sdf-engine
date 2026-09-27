import { type Primitive, PrimitiveKind, PrimitiveStorage } from './primitive';
import { defaultMaterial } from '~/materials/default-material';
import type { Material } from '~/materials/material';
import { euler, type Euler } from '~/math/euler';
import { vec3, type Vector3 } from '~/math/vec3';

export type BoxOptions = {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  size?: Vector3;
  radius?: number;
  material?: Material;
};

export function box({
  position = vec3.zero(),
  rotation = euler.zero(),
  scale = vec3.one(),
  size = vec3.one(),
  radius = 0,
  material = defaultMaterial,
}: BoxOptions = {}): Box {
  return new Box({ position, rotation, scale, size, radius, material });
}

export class Box implements Primitive {
  readonly storage: PrimitiveStorage;

  constructor(options: Required<BoxOptions>) {
    this.storage = new PrimitiveStorage({
      kind: PrimitiveKind.Box,
      position: options.position,
      rotation: options.rotation,
      scale: options.scale,
      bounds: options.size,
      radius: options.radius,
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

  get size(): Vector3 {
    return this.storage.bounds;
  }

  set size(size: Vector3) {
    this.storage.bounds.copy(size);
  }

  get radius(): number {
    return this.storage.radius;
  }

  set radius(radius: number) {
    this.storage.radius = radius;
  }
}
