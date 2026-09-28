import { Primitive, PrimitiveKind } from './primitive';
import { defaultMaterial } from '~/materials/default-material';
import type { Material } from '~/materials/material';
import { euler, type Euler } from '~/math/euler';
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

export class Sphere extends Primitive {
  constructor(options: Required<SphereOptions>) {
    super({ kind: PrimitiveKind.Sphere, ...options });

    this.position = options.position;
    this.rotation = options.rotation;
    this.scale = options.scale;
    this.radius = options.radius;
  }

  get radius(): number {
    return this.store.bounds.x;
  }

  set radius(radius: number) {
    this.store.bounds.x = radius;
  }
}
