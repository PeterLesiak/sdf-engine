import { Primitive, PrimitiveKind } from './primitive';
import { defaultMaterial, type Material } from '~/materials';
import { euler, type Euler } from '~/math/euler';
import { vec3, type Vector3 } from '~/math/vec3';

export type TorusOptions = {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  majorRadius?: number;
  minorRadius?: number;
  material?: Material;
};

export function torus({
  position = vec3.zero(),
  rotation = euler.zero(),
  scale = vec3.one(),
  majorRadius = 1.4,
  minorRadius = 0.4,
  material = defaultMaterial,
}: TorusOptions = {}): Torus {
  return new Torus({
    position,
    rotation,
    scale,
    majorRadius,
    minorRadius,
    material,
  });
}

export class Torus {
  readonly primitive: Primitive;

  constructor(options: Required<TorusOptions>) {
    this.primitive = new Primitive({
      kind: PrimitiveKind.Torus,
      position: options.position,
      rotation: options.rotation,
      scale: options.scale,
      bounds: vec3(options.majorRadius, options.minorRadius, 0),
      radius: 0,
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

  get majorRadius(): number {
    return this.primitive.bounds.x;
  }

  set majorRadius(majorRadius: number) {
    this.primitive.bounds.x = majorRadius;
  }

  get minorRadius(): number {
    return this.primitive.bounds.y;
  }

  set minorRadius(minorRadius: number) {
    this.primitive.bounds.y = minorRadius;
  }
}
