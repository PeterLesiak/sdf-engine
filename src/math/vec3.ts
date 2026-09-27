import { Signal } from '~/signal';

export function vec3(x: number, y: number, z: number): Vector3 {
  return new Vector3(x, y, z);
}

vec3.zero = () => vec3(0, 0, 0);
vec3.one = () => vec3(1, 1, 1);
vec3.up = () => vec3(0, 1, 0);

vec3.fromScalar = (scalar: number) => vec3(scalar, scalar, scalar);

export class Vector3 {
  readonly change = new Signal<[sender: Vector3]>();

  #x: number;

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = value;

    this.change.emit(this);
  }

  #y: number;

  get y() {
    return this.#y;
  }

  set y(value) {
    this.#y = value;

    this.change.emit(this);
  }

  #z: number;

  get z() {
    return this.#z;
  }

  set z(value) {
    this.#z = value;

    this.change.emit(this);
  }

  constructor(x: number, y: number, z: number) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  set(x: number, y: number, z: number): this {
    this.#x = x;
    this.#y = y;
    this.#z = z;

    this.change.emit(this);

    return this;
  }

  copy(v: Vector3): this {
    this.#x = v.x;
    this.#y = v.y;
    this.#z = v.z;

    this.change.emit(this);

    return this;
  }

  clone(): Vector3 {
    return vec3(this.#x, this.#y, this.#z);
  }

  add(v: Vector3): this {
    this.#x += v.#x;
    this.#y += v.#y;
    this.#z += v.#z;

    this.change.emit(this);

    return this;
  }

  sub(v: Vector3): Vector3 {
    return vec3(this.#x - v.#x, this.#y - v.#y, this.#z - v.#z);
  }

  cross(v: Vector3): Vector3 {
    return vec3(
      this.#y * v.#z - this.#z * v.#y,
      this.#z * v.#x - this.#x * v.#z,
      this.#x * v.#y - this.#y * v.#x,
    );
  }

  length(): number {
    const length = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z,
    );

    return length < 0.0001 ? 0 : length;
  }

  normalize(): this {
    const length = this.length();

    if (length === 0) {
      this.set(0, 0, 0);

      return this;
    }

    const inverseLength = 1 / length;
    this.#x *= inverseLength;
    this.#y *= inverseLength;
    this.#z *= inverseLength;

    this.change.emit(this);

    return this;
  }

  writeBuffer(buffer: Float32Array, offset: number): this {
    buffer[offset] = this.#x;
    buffer[offset + 1] = this.#y;
    buffer[offset + 2] = this.#z;

    return this;
  }
}
