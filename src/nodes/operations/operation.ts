import type { Primitive } from '../primitives/primitive';
import { Node } from '../node';
import type { Renderer } from '~/renderer/renderer';
import type { BufferWrite } from '~/renderer/utils';
import type { Matrix4 } from '~/math/mat4';
import { observeStore } from '~/utils';
import type { Enum } from '~/types';

export const OperationKind = {
  Union: 0,
  Difference: 1,
  Intersection: 2,
  SmoothUnion: 3,
} as const;

export type OperationKind = Enum<typeof OperationKind>;

export type OperationStore = {
  inverseMatrix: Matrix4;
  kind: OperationKind;
  param: number;
};

export type OperationOptions = {
  kind: OperationKind;
  object1: Primitive;
  object2?: Primitive;
  param: number;
};

export class Operation extends Node {
  #isDirty = true;

  get isDirty(): boolean {
    return this.#isDirty;
  }

  readonly store = observeStore<OperationStore>(
    {
      inverseMatrix: this.transform.inverseWorldMatrix,
      param: 0,
      kind: OperationKind.Union,
    },
    () => {
      this.#isDirty = true;
    },
  );

  readonly object1: Primitive;
  readonly object2?: Primitive;

  constructor(options: OperationOptions) {
    super();

    this.store.kind = options.kind;
    this.object1 = options.object1;
    this.object2 = options.object2;
    this.store.param = options.param;

    this.transform.change.subscribe(() => {
      this.#isDirty = true;
    });
  }

  computeMatrix(): this {
    this.transform.computeMatrix();
    this.object1.computeMatrix();
    this.object2?.computeMatrix();

    return this;
  }

  #nodeId = -1;

  readonly writeBuffer: BufferWrite = (view, offset) => {
    // mat4x4f (offset = 0, size = 16)
    this.store.inverseMatrix.writeBuffer(view.f32, offset);

    // f32 (offset = 16, size = 1)
    view.f32[offset + 16] = this.store.param;

    // u32 (offset = 20, size = 1)
    view.u32[offset + 20] = this.store.kind;
  };

  override flush(renderer: Renderer): number {
    if (this.object1.isDirty) {
      this.object1.flush(renderer);
    }

    if (this.object2?.isDirty) {
      this.object2?.flush(renderer);
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
