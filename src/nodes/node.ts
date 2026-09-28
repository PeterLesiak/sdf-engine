import type { Renderer } from '~/renderer/renderer';
import { Transform } from '~/math/transform';
import type { Euler } from '~/math/euler';
import type { Vector3 } from '~/math/vec3';

export class Node {
  readonly transform = new Transform();

  get position(): Vector3 {
    return this.transform.position;
  }

  set position(position: Vector3) {
    this.transform.position.copy(position);
  }

  get rotation(): Euler {
    return this.transform.rotation;
  }

  set rotation(rotation: Euler) {
    this.transform.rotation.copy(rotation);
  }

  get scale(): Vector3 {
    return this.transform.scale;
  }

  set scale(scale: Vector3) {
    this.transform.scale.copy(scale);
  }

  computeMatrix(): this {
    this.transform.computeMatrix();

    return this;
  }

  flush(_renderer: Renderer): number {
    return -1;
  }

  readonly children: Node[] = [];
}
