export type StorageBufferView = { u32: Uint32Array; f32: Float32Array };

export type StorageBufferWrite = (
  views: StorageBufferView,
  offset: number,
) => void;

export class IterableStorage {
  readonly device: GPUDevice;
  readonly stride: number;
  readonly capacity: number;

  readonly data: ArrayBuffer;
  readonly view: StorageBufferView;
  readonly buffer: GPUBuffer;

  constructor(device: GPUDevice, stride: number, capacity: number) {
    this.device = device;
    this.stride = stride;
    this.capacity = capacity;

    this.data = new ArrayBuffer(this.stride * this.capacity * 4);

    this.view = {
      u32: new Uint32Array(this.data),
      f32: new Float32Array(this.data),
    };

    this.buffer = this.device.createBuffer({
      size: this.data.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
  }

  elementCount = 0;

  #minDirtyElementIndex = Infinity;
  #maxDirtyElementIndex = -1;

  push(): number {
    return this.elementCount++;
  }

  update(elementIndex: number, write: StorageBufferWrite): this {
    write(this.view, elementIndex * this.stride);

    this.#minDirtyElementIndex = Math.min(
      this.#minDirtyElementIndex,
      elementIndex,
    );

    this.#maxDirtyElementIndex = Math.max(
      this.#maxDirtyElementIndex,
      elementIndex,
    );

    return this;
  }

  flush(): this {
    if (this.#maxDirtyElementIndex < 0) return this;

    const startBytes = this.#minDirtyElementIndex * this.stride * 4;
    const endBytes = (this.#maxDirtyElementIndex + 1) * this.stride * 4;

    this.device.queue.writeBuffer(
      this.buffer,
      startBytes,
      this.data,
      startBytes,
      endBytes - startBytes,
    );

    this.#minDirtyElementIndex = Infinity;
    this.#maxDirtyElementIndex = -1;

    return this;
  }
}
