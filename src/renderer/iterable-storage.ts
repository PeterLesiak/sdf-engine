import { createBufferView, type BufferView, type BufferWrite } from './utils';

export class IterableStorage {
  readonly device: GPUDevice;
  readonly stride: number;
  readonly capacity: number;

  readonly cpuBuffer: ArrayBuffer;
  readonly view: BufferView;
  readonly gpuBuffer: GPUBuffer;

  constructor(device: GPUDevice, stride: number, capacity: number) {
    this.device = device;
    this.stride = stride;
    this.capacity = capacity;

    this.cpuBuffer = new ArrayBuffer(this.stride * this.capacity * 4);

    this.view = createBufferView(this.cpuBuffer);

    this.gpuBuffer = this.device.createBuffer({
      size: this.cpuBuffer.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
  }

  #elementCount = 0;

  get elementCount(): number {
    return this.#elementCount;
  }

  push(): number {
    return this.#elementCount++;
  }

  #minDirtyElementIndex = Infinity;
  #maxDirtyElementIndex = -1;

  update(elementIndex: number, write: BufferWrite): this {
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
      this.gpuBuffer,
      startBytes,
      this.cpuBuffer,
      startBytes,
      endBytes - startBytes,
    );

    this.#minDirtyElementIndex = Infinity;
    this.#maxDirtyElementIndex = -1;

    return this;
  }
}
