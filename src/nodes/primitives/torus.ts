import { Primitive, PrimitiveKind } from './primitive';
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

export class Torus extends Primitive {
  constructor(options: Required<TorusOptions>) {
    super({ kind: PrimitiveKind.Torus, ...options });

    this.position = options.position;
    this.rotation = options.rotation;
    this.scale = options.scale;
    this.majorRadius = options.majorRadius;
    this.minorRadius = options.minorRadius;
  }

  get majorRadius(): number {
    return this.store.bounds.x;
  }

  set majorRadius(majorRadius: number) {
    this.store.bounds.x = majorRadius;
  }

  get minorRadius(): number {
    return this.store.bounds.y;
  }

  set minorRadius(minorRadius: number) {
    this.store.bounds.y = minorRadius;
  }
}
