import { Operation, OperationKind } from './operation';
import type { Primitive } from '../primitives/primitive';

export function difference(base: Primitive, cutter: Primitive): Difference {
  return new Difference(base, cutter);
}

export class Difference extends Operation {
  constructor(base: Primitive, cutter: Primitive) {
    super({
      kind: OperationKind.Difference,
      object1: base,
      object2: cutter,
      param: 0,
    });
  }
}
