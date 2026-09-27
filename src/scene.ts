import type { Engine } from '~/engine';
import { noop, Operation } from '~/operations';
import type { Primitive } from '~/primitives/primitive';

export interface SceneObject {
  readonly primitive: Primitive;
}

export type SceneNode = SceneObject | Operation;

export class Scene {
  readonly engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  readonly children: Operation[] = [];

  update(): this {
    for (const operation of this.children) {
      operation.flush();
    }

    return this;
  }

  add(...nodes: SceneNode[]): this {
    for (const node of nodes) {
      const operation = node instanceof Operation ? node : noop(node);
      operation.push(this.engine.renderer);

      this.children.push(operation);
    }

    return this;
  }
}
