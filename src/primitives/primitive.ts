import type { Renderer } from '~/renderer/renderer';
import type { Material } from '~/materials/material';
import { Transform } from '~/math/transform';
import type { Euler } from '~/math/euler';
import type { Vector3 } from '~/math/vec3';
import { isDictionary } from '~/utils';
import type { Enum } from '~/types';

export const PrimitiveKind = {
  Sphere: 0,
  Plane: 1,
  Box: 2,
  Torus: 3,
} as const;

export type PrimitiveKind = Enum<typeof PrimitiveKind>;

export interface Primitive {
  readonly storage: PrimitiveStorage;
}

export function isPrimitive(value: unknown): value is Primitive {
  return isDictionary(value) && value.storage instanceof PrimitiveStorage;
}

export type PrimitiveOptions = {
  kind: PrimitiveKind;
  radius: number;

  position: Vector3;
  rotation: Euler;
  scale: Vector3;

  bounds: Vector3;

  material: Material;
};

export class PrimitiveStorage {
  #isDirty = true;

  #kind: PrimitiveKind;

  get kind(): PrimitiveKind {
    return this.#kind;
  }

  set kind(kind: PrimitiveKind) {
    this.#kind = kind;
    this.#isDirty = true;
  }

  #radius: number;

  get radius(): number {
    return this.#radius;
  }

  set radius(radius: number) {
    this.#radius = radius;
    this.#isDirty = true;
  }

  readonly transform: Transform;

  readonly bounds: Vector3;

  readonly material: Material;

  renderer: Renderer | null = null;
  primitiveIndex = -1;
  materialIndex = 0;

  constructor(options: PrimitiveOptions) {
    this.#kind = options.kind;
    this.#radius = options.radius;

    this.transform = new Transform(
      options.position,
      options.rotation,
      options.scale,
    );

    this.transform.change.subscribe(() => {
      this.#isDirty = true;
    });

    this.bounds = options.bounds;

    this.bounds.change.subscribe(() => {
      this.#isDirty = true;
    });

    this.material = options.material;
  }

  readonly writeBuffer = (buffer: ArrayBuffer, offset: number): this => {
    const u32 = new Uint32Array(buffer);
    const f32 = new Float32Array(buffer);

    // mat4x4f (offset = 0, size = 16)
    this.transform.inverseWorldMatrix.writeBuffer(f32, offset);

    // vec3f (offset = 16, size = 3)
    this.bounds.writeBuffer(f32, offset + 16);

    // f32 (offset = 19, size = 1)
    f32[offset + 19] = this.radius;

    // u32 (offset = 20, size = 1)
    u32[offset + 20] = this.kind;

    // u32 (offset = 21, size = 1)
    u32[offset + 21] = this.materialIndex;

    return this;
  };

  push(renderer: Renderer): number {
    this.renderer = renderer;

    this.materialIndex = this.material.push(renderer);
    this.primitiveIndex = this.renderer.primitiveStorage.push();

    return this.primitiveIndex;
  }

  flush(): this {
    if (!this.renderer || this.primitiveIndex < 0) return this;

    if (!this.#isDirty) return this;

    this.transform.computeMatrix();

    this.material.flush();

    this.renderer.primitiveStorage.update(
      this.primitiveIndex,
      this.writeBuffer,
    );

    return this;
  }
}
