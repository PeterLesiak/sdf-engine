import { Primitive, PrimitiveKind } from './primitive';
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

export class Plane extends Primitive {
  constructor(options: Required<PlaneOptions>) {
    super({ kind: PrimitiveKind.Plane, ...options });

    this.position = options.position;
    this.rotation = options.rotation;
    this.scale = options.scale;
  }
}
