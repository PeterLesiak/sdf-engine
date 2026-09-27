import { rad } from './utils';
import { Signal } from '~/signal';
import type { Degrees } from '~/types';

export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';

export function euler(
  x: number,
  y: number,
  z: number,
  order: EulerOrder = 'XYZ',
): Euler {
  return new Euler(x, y, z, order);
}

euler.zero = (order: EulerOrder = 'XYZ') => euler(0, 0, 0, order);

export class Euler {
  readonly change = new Signal<[sender: Euler]>();

  #x: number;

  get x(): number {
    return this.#x;
  }

  set x(x: number) {
    this.#x = x;
    this.change.emit(this);
  }

  #y: number;

  get y(): number {
    return this.#y;
  }

  set y(y: number) {
    this.#y = y;
    this.change.emit(this);
  }

  #z: number;

  get z(): number {
    return this.#z;
  }

  set z(z: number) {
    this.#z = z;
    this.change.emit(this);
  }

  #order: EulerOrder;

  get order(): EulerOrder {
    return this.#order;
  }

  set order(order: EulerOrder) {
    this.#order = order;
    this.change.emit(this);
  }

  constructor(x: number, y: number, z: number, order: EulerOrder) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#order = order;
  }

  set(x: number, y: number, z: number, order = this.order): this {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#order = order;

    this.change.emit(this);

    return this;
  }

  copy(euler: Euler): this {
    this.#x = euler.#x;
    this.#y = euler.#y;
    this.#z = euler.#z;
    this.#order = euler.#order;

    this.change.emit(this);

    return this;
  }

  clone(): Euler {
    return new Euler(this.x, this.y, this.z, this.order);
  }

  setFromDegrees(x: Degrees, y: Degrees, z: Degrees): this {
    this.#x = x * rad;
    this.#y = y * rad;
    this.#z = z * rad;

    this.change.emit(this);

    return this;
  }
}
