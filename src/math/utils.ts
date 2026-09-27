import type { Degrees, Radians } from '~/types';

export const rad = Math.PI / 180;

export function degreesToRadians(degrees: Degrees): Radians {
  return (degrees * rad) as Radians;
}

export function remap01(value: number): number {
  return (value + 1) * 0.5;
}
