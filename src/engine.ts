import { createRenderer, type Renderer } from '~/renderer/renderer';
import { Scene } from '~/scene';
import { Signal } from '~/signal';
import type { Seconds } from '~/types';

export async function createEngine(options?: {
  canvas?: HTMLCanvasElement;
}): Promise<Engine> {
  const renderer = await createRenderer(options);

  if (!renderer) {
    throw 'failed to init renderer';
  }

  return new Engine(renderer);
}

export type FrameData = { elapsedTime: Seconds; deltaTime: Seconds };

export class Engine {
  readonly renderer: Renderer;

  readonly canvas: HTMLCanvasElement;

  readonly scene = new Scene(this);

  readonly tick = new Signal<[frame: FrameData]>();

  #frameCache: FrameData = {
    elapsedTime: 0 as Seconds,
    deltaTime: 0 as Seconds,
  };

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.canvas = this.renderer.canvas;

    let previousTimestamp = 0;

    const update = (timestamp: number) => {
      requestAnimationFrame(update);

      const deltaTime = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;

      this.#frameCache = {
        elapsedTime: timestamp as Seconds,
        deltaTime: deltaTime as Seconds,
      };

      this.tick.emit(this.#frameCache);
    };

    requestAnimationFrame(update);
  }

  render(frame?: FrameData): this {
    this.scene.update();

    this.renderer.render(frame ?? this.#frameCache);

    return this;
  }
}
