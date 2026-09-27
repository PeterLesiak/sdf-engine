export type StorageBufferView = {
  u32: Uint32Array;
  f32: Float32Array;
};

export type StorageBufferWrite = (
  views: StorageBufferView,
  offset: number,
) => void;

const headerSize = 4;

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

    this.data = new ArrayBuffer(headerSize + this.stride * this.capacity);

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

  #isHeaderDirty = false;
  #minDirtyElementIndex = Infinity;
  #maxDirtyElementIndex = -1;

  push(): number {
    const elementIndex = this.elementCount;

    const u32 = new Uint32Array(this.data);
    u32[0] = ++this.elementCount;

    this.#isHeaderDirty = true;

    return elementIndex;
  }

  update(elementIndex: number, write: StorageBufferWrite): this {
    write(this.view, headerSize + elementIndex * this.stride);

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

    const headerOffset = headerSize * 4;

    const startOffset = this.#minDirtyElementIndex * this.stride * 4;
    const startBytes = this.#isHeaderDirty ? 0 : headerOffset + startOffset;

    const endOffset = (this.#maxDirtyElementIndex + 1) * this.stride * 4;
    const endBytes = headerOffset + endOffset;

    this.device.queue.writeBuffer(
      this.buffer,
      startBytes,
      this.data,
      startBytes,
      endBytes - startBytes,
    );

    this.#isHeaderDirty = false;
    this.#minDirtyElementIndex = Infinity;
    this.#maxDirtyElementIndex = -1;

    return this;
  }
}
