import { Node } from '../node';
import type { Renderer } from '~/renderer/renderer';
import type { BufferWrite } from '~/renderer/utils';
import type { Material } from '~/materials/material';
import type { Matrix4 } from '~/math/mat4';
import type { Euler } from '~/math/euler';
import { vec3, Vector3 } from '~/math/vec3';
import { observeStore } from '~/utils';
import type { Enum } from '~/types';

export const PrimitiveKind = {
  Plane: 10,
  Box: 11,
  Sphere: 12,
  Torus: 13,
} as const;

export type PrimitiveKind = Enum<typeof PrimitiveKind>;

export type PrimitiveStore = {
  inverseMatrix: Matrix4;
  bounds: Vector3;
  radius: number;
  kind: PrimitiveKind;
  materialId: number;
};

export type PrimitiveOptions = {
  kind: PrimitiveKind;
  material: Material;
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
};

export class Primitive extends Node {
  #isDirty = true;

  get isDirty(): boolean {
    return this.#isDirty;
  }

  readonly store = observeStore<PrimitiveStore>(
    {
      inverseMatrix: this.transform.inverseWorldMatrix,
      bounds: vec3.zero(),
      radius: 0,
      kind: PrimitiveKind.Plane,
      materialId: 0,
    },
    () => {
      this.#isDirty = true;
    },
  );

  readonly material: Material;

  constructor(options: PrimitiveOptions) {
    super();

    this.store.kind = options.kind;
    this.position = options.position;
    this.rotation = options.rotation;
    this.scale = options.scale;
    this.material = options.material;

    this.transform.change.subscribe(() => {
      this.#isDirty = true;
    });
  }

  #nodeId = -1;

  readonly writeBuffer: BufferWrite = (view, offset) => {
    // mat4x4f (offset = 0, size = 16)
    this.store.inverseMatrix.writeBuffer(view.f32, offset);

    // vec3f (offset = 16, size = 3)
    this.store.bounds.writeBuffer(view.f32, offset + 16);

    // f32 (offset = 19, size = 1)
    view.f32[offset + 19] = this.store.radius;

    // u32 (offset = 20, size = 1)
    view.u32[offset + 20] = this.store.kind;

    // u32 (offset = 21, size = 1)
    view.u32[offset + 21] = this.store.materialId;
  };

  override flush(renderer: Renderer): number {
    if (this.material.isDirty) {
      this.store.materialId = this.material.flush(renderer);
    }

    if (this.#isDirty) {
      if (this.#nodeId < 0) {
        this.#nodeId = renderer.nodeStorage.push();
      }

      renderer.nodeStorage.update(this.#nodeId, this.writeBuffer);

      this.#isDirty = false;
    }

    return this.#nodeId;
  }
}
