import { Camera } from './camera';
import { vec3 } from '~/math/vec3';
import { degreesToRadians } from '~/math/utils';
import type { Degrees } from '~/types';

export class OrbitCamera extends Camera {
  distance: number;
  azimuth: number;
  elevation: number;

  minDistance = 0.5;
  maxDistance = 100;
  minElevation = -Math.PI / 2 + 0.01;
  maxElevation = Math.PI / 2 - 0.01;

  rotateSpeed = 0.005;
  zoomSpeed = 0.0015;

  #isDragging = false;
  #lastPointer = { x: 0, y: 0 };

  constructor(
    target = vec3.zero(),
    distance = 5,
    azimuth = 0,
    elevation = 0,
    fov = degreesToRadians(60 as Degrees),
  ) {
    super(vec3(0, 0, distance), target, vec3.up(), fov);

    this.distance = distance;
    this.azimuth = azimuth;
    this.elevation = elevation;
    this.updatePosition();
  }

  override attach(element: HTMLElement): this {
    super.attach(element);

    window.addEventListener('pointermove', this.#onPointerMove);
    window.addEventListener('pointerup', this.#onPointerUp);

    element.addEventListener('pointerdown', this.#onPointerDown);
    element.addEventListener('wheel', this.#onWheel, { passive: false });

    return this;
  }

  override detach(): this {
    if (!this.element) return this;

    window.removeEventListener('pointermove', this.#onPointerMove);
    window.removeEventListener('pointerup', this.#onPointerUp);

    this.element.removeEventListener('pointerdown', this.#onPointerDown);
    this.element.removeEventListener('wheel', this.#onWheel);

    super.detach();

    return this;
  }

  updatePosition(): void {
    this.elevation = Math.max(
      this.minElevation,
      Math.min(this.maxElevation, this.elevation),
    );

    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance),
    );

    const azimuthSin = Math.sin(this.azimuth);
    const azimuthCos = Math.cos(this.azimuth);
    const elevationSin = Math.sin(this.elevation);
    const elevationCos = Math.cos(this.elevation);

    const x = this.target.x + this.distance * elevationCos * azimuthSin;
    const y = this.target.y + this.distance * elevationSin;
    const z = this.target.z + this.distance * elevationCos * azimuthCos;

    this.position.set(x, y, z);

    this.computeMatrix();
  }

  #onPointerDown = (e: PointerEvent) => {
    this.#isDragging = true;
    this.#lastPointer = { x: e.clientX, y: e.clientY };
  };

  #onPointerMove = (e: PointerEvent) => {
    if (!this.#isDragging) return;

    const dx = e.clientX - this.#lastPointer.x;
    const dy = e.clientY - this.#lastPointer.y;

    this.#lastPointer = { x: e.clientX, y: e.clientY };
    this.azimuth -= dx * this.rotateSpeed;
    this.elevation += dy * this.rotateSpeed;

    this.updatePosition();
  };

  #onPointerUp = () => {
    this.#isDragging = false;
  };

  #onWheel = (e: WheelEvent) => {
    e.preventDefault();

    this.distance += e.deltaY * this.zoomSpeed * (this.distance * 0.1);

    this.updatePosition();
  };
}
