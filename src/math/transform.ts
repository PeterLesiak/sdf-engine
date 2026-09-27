import { mat4 } from './mat4';
import type { Euler } from './euler';
import type { Vector3 } from './vec3';
import { Signal } from '~/signal';

export class Transform {
  readonly position: Vector3;
  readonly rotation: Euler;
  readonly scale: Vector3;

  readonly change = new Signal<[sender: Transform]>();

  constructor(position: Vector3, rotation: Euler, scale: Vector3) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;

    this.position.change.subscribe(() => {
      this.#isDirty = true;
      this.change.emit(this);
    });

    this.rotation.change.subscribe(() => {
      this.#isDirty = true;
      this.change.emit(this);
    });

    this.scale.change.subscribe(() => {
      this.#isDirty = true;
      this.change.emit(this);
    });
  }

  #isDirty = true;

  readonly inverseWorldMatrix = mat4();

  computeMatrix(): boolean {
    if (!this.#isDirty) {
      return false;
    }

    this.inverseWorldMatrix.composeInverse(
      this.position,
      this.rotation,
      this.scale,
    );

    this.#isDirty = false;

    return true;
  }
}
