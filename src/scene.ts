import type { Engine } from '~/engine';
import type { Camera } from '~/cameras/camera';
import type { Node } from '~/nodes/node';

export type SceneOptions = { engine: Engine; camera: Camera };

export class Scene {
  readonly engine: Engine;
  readonly camera: Camera;

  constructor(options: SceneOptions) {
    this.engine = options.engine;
    this.camera = options.camera;
  }

  readonly children: Node[] = [];

  update(): this {
    this.camera.computeMatrix();

    for (const child of this.children) {
      child.computeMatrix();

      child.flush(this.engine.renderer);
    }

    return this;
  }

  add(...nodes: Node[]): this {
    this.children.push(...nodes);

    return this;
  }
}
