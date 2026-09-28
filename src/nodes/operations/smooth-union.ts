import { Operation, OperationKind } from './operation';
import type { Primitive } from '../primitives/primitive';

export function smoothUnion(
  object1: Primitive,
  object2: Primitive,
  smoothness = 0.5,
): SmoothUnion {
  return new SmoothUnion(object1, object2, smoothness);
}

export class SmoothUnion extends Operation {
  constructor(object1: Primitive, object2: Primitive, smoothness: number) {
    super({
      kind: OperationKind.SmoothUnion,
      object1,
      object2,
      param: smoothness,
    });
  }

  get smoothness(): number {
    return this.store.param;
  }

  set smoothness(smoothness: number) {
    this.store.param = smoothness;
  }
}
