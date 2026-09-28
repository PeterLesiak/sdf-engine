import { Operation, OperationKind } from './operation';
import type { Primitive } from '../primitives/primitive';

export function union(object1: Primitive, object2: Primitive): Union {
  return new Union(object1, object2);
}

export class Union extends Operation {
  constructor(object1: Primitive, object2: Primitive) {
    super({
      kind: OperationKind.Union,
      object1,
      object2,
      param: 0,
    });
  }
}
