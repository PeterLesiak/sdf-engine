import { Operation, OperationKind } from './operation';
import type { Primitive } from '../primitives/primitive';

export function intersection(
  object1: Primitive,
  object2: Primitive,
): Intersection {
  return new Intersection(object1, object2);
}

export class Intersection extends Operation {
  constructor(object1: Primitive, object2: Primitive) {
    super({
      kind: OperationKind.Intersection,
      object1,
      object2,
      param: 0,
    });
  }
}
