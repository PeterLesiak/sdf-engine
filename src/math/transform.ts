import { mat4 } from './mat4';
import { euler, type Euler } from './euler';
import { vec3, type Vector3 } from './vec3';
import { Signal } from '~/signal';

export class Transform {
  readonly position: Vector3;
  readonly rotation: Euler;
  readonly scale: Vector3;

  readonly change = new Signal<[sender: Transform]>();

  constructor(
    position = vec3.zero(),
    rotation = euler.zero(),
    scale = vec3.one(),
  ) {
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
