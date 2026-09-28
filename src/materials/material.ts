import type { Renderer } from '~/renderer/renderer';
import type { BufferWrite } from '~/renderer/utils';
import type { Vector3 } from '~/math/vec3';

export interface MaterialOptions {
  color: Vector3;
}

export function material(options: MaterialOptions): Material {
  return new Material(options);
}

export class Material {
  #isDirty = true;

  get isDirty(): boolean {
    return this.#isDirty;
  }

  readonly color: Vector3;

  #materialId = -1;

  constructor(options: MaterialOptions) {
    this.color = options.color;

    this.color.change.subscribe(() => {
      this.#isDirty = true;
    });
  }

  readonly writeBuffer: BufferWrite = (view, offset): this => {
    // vec3f (offset = 0, size = 3)
    this.color.writeBuffer(view.f32, offset);

    return this;
  };

  flush(renderer: Renderer): number {
    if (!this.#isDirty) {
      return this.#materialId;
    }

    if (this.#materialId < 0) {
      this.#materialId = renderer.materialStorage.push();
    }

    renderer.materialStorage.update(this.#materialId, this.writeBuffer);

    return this.#materialId;
  }
}
