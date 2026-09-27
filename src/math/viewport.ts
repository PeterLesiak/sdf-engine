export function viewport(width: number, height: number): Viewport {
  return new Viewport(width, height);
}

viewport.zero = () => viewport(0, 0);

export class Viewport {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  set(width: number, height: number): this {
    this.width = width;
    this.height = height;

    return this;
  }

  equals(width: number, height: number): boolean {
    return this.width === width && this.height === height;
  }

  getAspect(): number {
    if (this.height === 0) {
      return 0;
    }

    return this.width / this.height;
  }
}
