import { IterableStorage } from './iterable-storage';
import shader from './shader.wgsl?raw';
import type { FrameData } from '~/engine';
import { mat4 } from '~/math/mat4';
import { vec3 } from '~/math/vec3';
import { Viewport, viewport } from '~/math/viewport';
import { degreesToRadians } from '~/math/utils';
import type { Degrees } from '~/types';

export type StorageBufferWrite = (buffer: ArrayBuffer, offset: number) => void;

export type RendererOptions = {
  canvas?: HTMLCanvasElement;
};

export interface Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly viewport: Viewport;

  readonly operationStorage: IterableStorage;
  readonly primitiveStorage: IterableStorage;
  readonly materialStorage: IterableStorage;

  resizeToViewport(): boolean;
  render(frame: FrameData): void;
}

export async function createRenderer(
  options: RendererOptions = {},
): Promise<Renderer | null> {
  const device = await createGPUDevice();

  if (!device) return null;

  const canvas = options.canvas ?? document.createElement('canvas');
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  const context = canvas.getContext('webgpu');

  if (!context) return null;

  context.configure({
    device,
    format: canvasFormat,
    alphaMode: 'premultiplied',
    colorSpace: 'display-p3',
  });

  const module = device.createShaderModule({ code: shader });

  const uniformData = new Float32Array(16 + 4);

  const cameraWorld = mat4.cameraWorld(vec3(0, 0, 5), vec3(0, 0, 0));
  cameraWorld.writeBuffer(uniformData, 0);

  uniformData[18] = degreesToRadians(60 as Degrees);

  const uniformBuffer = device.createBuffer({
    size: uniformData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      },
    ],
  });

  const uniformBindGroup = device.createBindGroup({
    layout: uniformBindGroupLayout,
    entries: [{ binding: 0, resource: uniformBuffer }],
  });

  const operationStorage = new IterableStorage(device, 4, 100);
  const primitiveStorage = new IterableStorage(device, 24, 100);
  const materialStorage = new IterableStorage(device, 4, 100);

  const storageBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' },
      },
    ],
  });

  const storageBindGroup = device.createBindGroup({
    layout: storageBindGroupLayout,
    entries: [
      { binding: 0, resource: operationStorage },
      { binding: 1, resource: primitiveStorage },
      { binding: 2, resource: materialStorage },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [uniformBindGroupLayout, storageBindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: { module },
    fragment: { module, targets: [{ format: canvasFormat }] },
  });

  return {
    canvas,
    viewport: viewport.zero(),

    operationStorage,
    primitiveStorage,
    materialStorage,

    resizeToViewport() {
      const { clientWidth: width, clientHeight: height } = canvas;

      if (this.viewport.equals(width, height)) {
        return false;
      }

      this.viewport.set(width, height);

      canvas.width = this.viewport.width;
      canvas.height = this.viewport.height;

      return true;
    },

    render(frame) {
      operationStorage.flush();
      primitiveStorage.flush();
      materialStorage.flush();

      this.resizeToViewport();

      uniformData[16] = this.viewport.width;
      uniformData[17] = this.viewport.height;
      uniformData[19] = frame.elapsedTime;

      device.queue.writeBuffer(uniformBuffer, 0, uniformData);

      const encoder = device.createCommandEncoder();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });

      pass.setPipeline(pipeline);
      pass.setBindGroup(0, uniformBindGroup);
      pass.setBindGroup(1, storageBindGroup);
      pass.draw(3);
      pass.end();

      device.queue.submit([encoder.finish()]);
    },
  } satisfies Renderer;
}

async function createGPUDevice(): Promise<GPUDevice | null> {
  if (!('gpu' in navigator)) return null;

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) return null;

  const device = await adapter.requestDevice();

  return device;
}
