import type { Renderer } from '~/renderer/renderer';
import type { StorageBufferWrite } from '~/renderer/iterable-storage';
import type { Primitive } from '~/primitives/primitive';
import { isDictionary } from '~/utils';
import type { Enum } from '~/types';

export const OperationKind = {
  None: 0,
  Union: 1,
  Difference: 2,
  Intersection: 3,
  SmoothUnion: 4,
} as const;

export type OperationKind = Enum<typeof OperationKind>;

export interface Operation {
  readonly storage: OperationStorage;
}

export function isOperation(value: unknown): value is Operation {
  return isDictionary(value) && value.storage instanceof OperationStorage;
}

export type OperationOptions = {
  kind: OperationKind;
  object1: Primitive;
  object2?: Primitive;
  param: number;
};

export class OperationStorage {
  #isDirty = true;

  #kind: OperationKind;

  get kind(): OperationKind {
    return this.#kind;
  }

  set kind(kind: OperationKind) {
    this.#kind = kind;
    this.#isDirty = true;
  }

  #param: number;

  get param(): number {
    return this.#param;
  }

  set param(param: number) {
    this.#param = param;
    this.#isDirty = true;
  }

  readonly object1: Primitive;
  readonly object2?: Primitive;

  renderer: Renderer | null = null;
  operationIndex = -1;
  primitive1Index = 0;
  primitive2Index = 0;

  constructor(options: OperationOptions) {
    this.#kind = options.kind;
    this.#param = options.param;

    this.object1 = options.object1;
    this.object2 = options.object2;
  }

  readonly writeBuffer: StorageBufferWrite = ({ u32, f32 }, offset) => {
    // u32 (offset = 0, size = 1)
    u32[offset] = this.kind;

    // u32 (offset = 1, size = 1)
    u32[offset + 1] = this.primitive1Index;

    // u32 (offset = 2, size = 1)
    u32[offset + 2] = this.primitive2Index;

    // f32 (offset = 3, size = 1)
    f32[offset + 3] = this.param;

    return this;
  };

  push(renderer: Renderer): this {
    this.renderer = renderer;

    this.primitive1Index = this.object1.storage.push(renderer);

    if (this.object2) {
      this.primitive2Index = this.object2.storage.push(renderer);
    }

    this.operationIndex = renderer.operationStorage.push();

    return this;
  }

  flush(): this {
    if (!this.renderer || this.operationIndex < 0) return this;

    if (!this.#isDirty) return this;

    this.object1.storage.flush();
    this.object2?.storage.flush();

    this.renderer.operationStorage.update(
      this.operationIndex,
      this.writeBuffer,
    );

    return this;
  }
}
