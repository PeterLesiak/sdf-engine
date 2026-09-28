import { Primitive, PrimitiveKind } from './primitive';
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

export class Box extends Primitive {
  constructor(options: Required<BoxOptions>) {
    super({ kind: PrimitiveKind.Box, ...options });

    this.position = options.position;
    this.rotation = options.rotation;
    this.scale = options.scale;
    this.size = options.size;
    this.radius = options.radius;
  }

  get size(): Vector3 {
    return this.store.bounds;
  }

  set size(size: Vector3) {
    this.store.bounds.copy(size);
  }

  get radius(): number {
    return this.store.radius;
  }

  set radius(radius: number) {
    this.store.radius = radius;
  }
}
