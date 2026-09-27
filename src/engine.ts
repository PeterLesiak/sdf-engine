import { createRenderer, type Renderer } from '~/renderer/renderer';
import { Scene } from '~/scene';
import { Camera } from '~/cameras/camera';
import { Signal } from '~/signal';
import type { Seconds } from '~/types';

export type EngineOptions = {
  canvas?: HTMLCanvasElement;
  camera?: Camera;
};

export async function createEngine(
  options: EngineOptions = {},
): Promise<Engine> {
  const renderer = await createRenderer({ canvas: options.canvas });

  if (!renderer) {
    throw 'failed to init renderer';
  }

  const camera = options.camera ?? new Camera();

  return new Engine(renderer, camera);
}

export type FrameData = { elapsedTime: Seconds; deltaTime: Seconds };

export class Engine {
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly canvas: HTMLCanvasElement;

  readonly tick = new Signal<[frame: FrameData]>();

  #frameCache: FrameData = {
    elapsedTime: 0 as Seconds,
    deltaTime: 0 as Seconds,
  };

  constructor(renderer: Renderer, camera: Camera) {
    this.renderer = renderer;
    this.scene = new Scene({ engine: this, camera });

    this.canvas = this.renderer.canvas;
    this.scene.camera.attach(this.canvas);

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

    this.renderer.render(this.scene.camera, frame ?? this.#frameCache);

    return this;
  }
}
