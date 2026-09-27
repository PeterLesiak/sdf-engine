import type { Renderer } from '~/renderer/renderer';
import type { Vector3 } from '~/math/vec3';

export interface MaterialOptions {
  color: Vector3;
}

export function material(options: MaterialOptions): Material {
  return new Material(options);
}

export class Material {
  #isDirty = true;

  readonly color: Vector3;

  renderer: Renderer | null = null;
  materialIndex = -1;

  constructor(options: MaterialOptions) {
    this.color = options.color;

    this.color.change.subscribe(() => {
      this.#isDirty = true;
    });
  }

  readonly writeBuffer = (buffer: ArrayBuffer, offset: number): this => {
    const f32 = new Float32Array(buffer);

    // vec3f (offset = 0, size = 3)
    this.color.writeBuffer(f32, offset);

    return this;
  };

  push(renderer: Renderer): number {
    this.renderer = renderer;
    this.materialIndex = renderer.materialStorage.push();

    return this.materialIndex;
  }

  flush(): this {
    if (!this.renderer || this.materialIndex < 0) return this;

    if (!this.#isDirty) return this;

    this.renderer.materialStorage.update(this.materialIndex, this.writeBuffer);

    return this;
  }
}
