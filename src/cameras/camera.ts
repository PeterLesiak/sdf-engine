import { mat4, Matrix4 } from '~/math/mat4';
import { vec3, Vector3 } from '~/math/vec3';
import { degreesToRadians } from '~/math/utils';
import type { Degrees, Radians } from '~/types';
import type { BufferWrite } from '~/renderer/utils';

export class Camera {
  readonly position: Vector3;
  readonly target: Vector3;
  readonly up: Vector3;

  fov: Radians;

  readonly worldMatrix: Matrix4 = mat4();

  constructor(
    position = vec3(0, 0, 5),
    target = vec3(0, 0, 0),
    up = vec3.up(),
    fov: Radians = degreesToRadians(60 as Degrees),
  ) {
    this.position = position;
    this.target = target;
    this.up = up;
    this.fov = fov;
  }

  element: HTMLElement | null = null;

  attach(element: HTMLElement): this {
    this.element = element;

    return this;
  }

  detach(): this {
    this.element = null;

    return this;
  }

  computeMatrix(): this {
    const matrix = mat4.cameraWorld(this.position, this.target, this.up);

    this.worldMatrix.elements.set(matrix.elements);

    return this;
  }

  readonly writeBuffer: BufferWrite = (view, offset) => {
    // mat4x4f (offset = 0, size = 16)
    this.worldMatrix.writeBuffer(view.f32, offset);

    // f32 (offset = 18, size = 1)
    view.f32[offset + 18] = this.fov;

    return this;
  };
}
