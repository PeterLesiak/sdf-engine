import { type Operation, OperationKind, OperationStorage } from './operation';
import type { Primitive } from '~/primitives/primitive';

export function smoothUnion(
  object1: Primitive,
  object2: Primitive,
  smoothness = 0.5,
): SmoothUnionOperation {
  return new SmoothUnionOperation(object1, object2, smoothness);
}

export class SmoothUnionOperation implements Operation {
  readonly storage: OperationStorage;

  constructor(object1: Primitive, object2: Primitive, smoothness: number) {
    this.storage = new OperationStorage({
      kind: OperationKind.SmoothUnion,
      object1,
      object2,
      param: smoothness,
    });
  }

  get object1(): Primitive {
    return this.storage.object1;
  }

  get object2(): Primitive {
    return this.storage.object2!;
  }

  get smoothness(): number {
    return this.storage.param;
  }

  set smoothness(smoothness: number) {
    this.storage.param = smoothness;
  }
}
