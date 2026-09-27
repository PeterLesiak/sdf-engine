import { Primitive, PrimitiveKind } from './primitive';
import { defaultMaterial, type Material } from '~/materials';
import { euler, type Euler } from '~/math/euler';
import { vec3, type Vector3 } from '~/math/vec3';

export type BoxOptions = {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  size?: Vector3;
  radius?: number;
  material?: Material;
};

export function box({
  position = vec3.zero(),
  rotation = euler.zero(),
  scale = vec3.one(),
  size = vec3.one(),
  radius = 0,
  material = defaultMaterial,
}: BoxOptions = {}): Box {
  return new Box({ position, rotation, scale, size, radius, material });
}

export class Box {
  readonly primitive: Primitive;

  constructor(options: Required<BoxOptions>) {
    this.primitive = new Primitive({
      kind: PrimitiveKind.Box,
      position: options.position,
      rotation: options.rotation,
      scale: options.scale,
      bounds: options.size,
      radius: options.radius,
      material: options.material,
    });
  }

  get material(): Material {
    return this.primitive.material;
  }

  get position(): Vector3 {
    return this.primitive.transform.position;
  }

  set position(position: Vector3) {
    this.primitive.transform.position.copy(position);
  }

  get rotation(): Euler {
    return this.primitive.transform.rotation;
  }

  set rotation(rotation: Euler) {
    this.primitive.transform.rotation.copy(rotation);
  }

  get scale(): Vector3 {
    return this.primitive.transform.scale;
  }

  set scale(scale: Vector3) {
    this.primitive.transform.scale.copy(scale);
  }

  get size(): Vector3 {
    return this.primitive.bounds;
  }

  set size(size: Vector3) {
    this.primitive.bounds.copy(size);
  }

  get radius(): number {
    return this.primitive.radius;
  }

  set radius(radius: number) {
    this.primitive.radius = radius;
  }
}
