import { PrimitiveKind, PrimitiveStorage, type Primitive } from './primitive';
import { defaultMaterial } from '~/materials/default-material';
import type { Material } from '~/materials/material';
import { euler, type Euler } from '~/math/euler';
import { vec3, type Vector3 } from '~/math/vec3';

export type TorusOptions = {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  majorRadius?: number;
  minorRadius?: number;
  material?: Material;
};

export function torus({
  position = vec3.zero(),
  rotation = euler.zero(),
  scale = vec3.one(),
  majorRadius = 1.4,
  minorRadius = 0.4,
  material = defaultMaterial,
}: TorusOptions = {}): Torus {
  return new Torus({
    position,
    rotation,
    scale,
    majorRadius,
    minorRadius,
    material,
  });
}

export class Torus implements Primitive {
  readonly storage: PrimitiveStorage;

  constructor(options: Required<TorusOptions>) {
    this.storage = new PrimitiveStorage({
      kind: PrimitiveKind.Torus,
      position: options.position,
      rotation: options.rotation,
      scale: options.scale,
      bounds: vec3(options.majorRadius, options.minorRadius, 0),
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

  get majorRadius(): number {
    return this.storage.bounds.x;
  }

  set majorRadius(majorRadius: number) {
    this.storage.bounds.x = majorRadius;
  }

  get minorRadius(): number {
    return this.storage.bounds.y;
  }

  set minorRadius(minorRadius: number) {
    this.storage.bounds.y = minorRadius;
  }
}
