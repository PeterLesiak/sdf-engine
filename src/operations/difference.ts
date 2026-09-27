import { type Operation, OperationKind, OperationStorage } from './operation';
import type { Primitive } from '~/primitives/primitive';

export function difference(
  base: Primitive,
  cutter: Primitive,
): DifferenceOperation {
  return new DifferenceOperation(base, cutter);
}

export class DifferenceOperation implements Operation {
  readonly storage: OperationStorage;

  constructor(base: Primitive, cutter: Primitive) {
    this.storage = new OperationStorage({
      kind: OperationKind.Difference,
      object1: base,
      object2: cutter,
      param: 0,
    });
  }

  get base(): Primitive {
    return this.storage.object1;
  }

  get cutter(): Primitive {
    return this.storage.object2!;
  }
}
