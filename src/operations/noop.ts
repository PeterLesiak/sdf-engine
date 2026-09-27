import { type Operation, OperationKind, OperationStorage } from './operation';
import type { Primitive } from '~/primitives/primitive';

export function noop(object: Primitive): NoopOperation {
  return new NoopOperation(object);
}

export class NoopOperation implements Operation {
  readonly storage: OperationStorage;

  constructor(object: Primitive) {
    this.storage = new OperationStorage({
      kind: OperationKind.None,
      object1: object,
      param: 0,
    });
  }

  get object(): Primitive {
    return this.storage.object1;
  }
}
