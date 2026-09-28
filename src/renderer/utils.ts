export type BufferView = {
  i32: Int32Array;
  u32: Uint32Array;
  f32: Float32Array;
};

export type BufferWrite = (view: BufferView, offset: number) => void;

export function createBufferView(buffer: ArrayBuffer): BufferView {
  return {
    i32: new Int32Array(buffer),
    u32: new Uint32Array(buffer),
    f32: new Float32Array(buffer),
  };
}
