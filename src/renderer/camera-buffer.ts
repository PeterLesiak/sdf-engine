import { createBufferView, type BufferView, type BufferWrite } from './utils';

const bufferStride = 24;

export class CameraBuffer {
  readonly device: GPUDevice;

  readonly cpuBuffer: ArrayBuffer;
  readonly view: BufferView;
  readonly gpuBuffer: GPUBuffer;

  constructor(device: GPUDevice) {
    this.device = device;

    this.cpuBuffer = new ArrayBuffer(bufferStride * 4);

    this.view = createBufferView(this.cpuBuffer);

    this.gpuBuffer = this.device.createBuffer({
      size: this.cpuBuffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  update(write: BufferWrite): this {
    write(this.view, 0);

    this.device.queue.writeBuffer(this.gpuBuffer, 0, this.cpuBuffer);

    return this;
  }
}
