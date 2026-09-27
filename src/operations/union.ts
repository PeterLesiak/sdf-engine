import { type Operation, OperationKind, OperationStorage } from './operation';
import type { Primitive } from '~/primitives/primitive';

export function union(object1: Primitive, object2: Primitive): UnionOperation {
  return new UnionOperation(object1, object2);
}

export class UnionOperation implements Operation {
  readonly storage: OperationStorage;

  constructor(object1: Primitive, object2: Primitive) {
    this.storage = new OperationStorage({
      kind: OperationKind.Union,
      object1,
      object2,
      param: 0,
    });
  }

  get object1(): Primitive {
    return this.storage.object1;
  }

  get object2(): Primitive {
    return this.storage.object2!;
  }
}
