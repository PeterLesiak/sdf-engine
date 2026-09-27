import type { Engine } from '~/engine';
import { noop } from '~/operations/noop';
import type { Operation } from '~/operations/operation';
import { isPrimitive, type Primitive } from '~/primitives/primitive';

export type SceneNode = Operation | Primitive;

export class Scene {
  readonly engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  readonly children: Operation[] = [];

  update(): this {
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
