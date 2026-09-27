import type { Renderer } from '~/renderer/renderer';
import type { SceneObject } from '~/scene';
import type { Enum } from '~/types';

export const OperationKind = {
  None: 0,
  Union: 1,
  Subtraction: 2,
  Intersection: 3,
  SmoothUnion: 4,
} as const;

export type OperationKind = Enum<typeof OperationKind>;

export function noop(object: SceneObject): Operation {
  return new Operation({
    kind: OperationKind.None,
    object1: object,
    param: 0,
  });
}

export function union(object1: SceneObject, object2: SceneObject): Operation {
  return new Operation({
    kind: OperationKind.Union,
    object1,
    object2,
    param: 0,
  });
}

export function subtraction(
  object1: SceneObject,
  object2: SceneObject,
): Operation {
  return new Operation({
    kind: OperationKind.Subtraction,
    object1,
    object2,
    param: 0,
  });
}

export function intersection(
  object1: SceneObject,
  object2: SceneObject,
): Operation {
  return new Operation({
    kind: OperationKind.Intersection,
    object1,
    object2,
    param: 0,
  });
}

export function smoothUnion(
  object1: SceneObject,
  object2: SceneObject,
  k = 0.5,
): Operation {
  return new Operation({
    kind: OperationKind.SmoothUnion,
    object1,
    object2,
    param: k,
  });
}

export type OperationOptions = {
  kind: OperationKind;
  object1: SceneObject;
  object2?: SceneObject;
  param: number;
};

export class Operation {
  kind: OperationKind;
  object1: SceneObject;
  object2?: SceneObject;
  param: number;

  renderer: Renderer | null = null;
  operationIndex = -1;
  primitive1Index = 0;
  primitive2Index = 0;

  constructor(options: OperationOptions) {
    this.kind = options.kind;
    this.object1 = options.object1;
    this.object2 = options.object2;
    this.param = options.param;
  }

  readonly writeBuffer = (buffer: ArrayBuffer, offset: number): this => {
    const u32 = new Uint32Array(buffer);
    const f32 = new Float32Array(buffer);

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

    this.primitive1Index = this.object1.primitive.push(renderer);

    if (this.object2) {
      this.primitive2Index = this.object2.primitive.push(renderer);
    }

    this.operationIndex = renderer.operationStorage.push();

    return this;
  }

  flush(): this {
    if (!this.renderer || this.operationIndex < 0) return this;

    this.object1.primitive.flush();
    this.object2?.primitive.flush();

    this.renderer.operationStorage.update(
      this.operationIndex,
      this.writeBuffer,
    );

    return this;
  }
}
