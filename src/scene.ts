import type { Engine } from '~/engine';
import type { Camera } from '~/cameras/camera';
import { noop } from '~/operations/noop';
import type { Operation } from '~/operations/operation';
import { isPrimitive, type Primitive } from '~/primitives/primitive';

export type SceneNode = Operation | Primitive;

export type SceneOptions = {
  engine: Engine;
  camera: Camera;
};

export class Scene {
  readonly engine: Engine;
  readonly camera: Camera;

  constructor(options: SceneOptions) {
    this.engine = options.engine;
    this.camera = options.camera;
  }

  readonly children: Operation[] = [];

  update(): this {
    this.camera.computeMatrix();

    for (const operation of this.children) {
      operation.storage.flush();
    }

    return this;
  }

  add(...nodes: SceneNode[]): this {
    for (const node of nodes) {
      const operation = isPrimitive(node) ? noop(node) : node;
      operation.storage.push(this.engine.renderer);

      this.children.push(operation);
    }

    return this;
  }
}
