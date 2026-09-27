import type { Euler } from './euler';
import { vec3, type Vector3 } from './vec3';
import type { Radians } from '~/types';

export function mat4(): Matrix4 {
  // prettier-ignore
  return new Matrix4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  );
}

mat4.cameraWorld = (eye: Vector3, target: Vector3, up = vec3.up()): Matrix4 => {
  const zAxis = eye.sub(target).normalize();
  const xAxis = up.cross(zAxis).normalize();
  const yAxis = zAxis.cross(xAxis).normalize();

  // prettier-ignore
  const matrix = new Matrix4(
    xAxis.x, yAxis.x, zAxis.x, eye.x,
    xAxis.y, yAxis.y, zAxis.y, eye.y,
    xAxis.z, yAxis.z, zAxis.z, eye.z,
    0,       0,       0,       1,
  );

  return matrix;
};

mat4.perspective = (
  fov: Radians,
  aspect: number,
  near: number,
  far: number,
): Matrix4 => {
  const f = 1.0 / Math.tan(fov / 2.0);
  const rangeInverse = 1.0 / (near - far);

  // prettier-ignore
  const matrix = new Matrix4(
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far * rangeInverse, near * far * rangeInverse,
    0, 0, -1, 0, 
  );

  return matrix;
};

export class Matrix4 {
  readonly elements = new Float32Array(16);

  // prettier-ignore
  constructor(
    n11: number, n12: number, n13: number, n14: number,
    n21: number, n22: number, n23: number, n24: number,
    n31: number, n32: number, n33: number, n34: number,
    n41: number, n42: number, n43: number, n44: number,
  ) {
    this.elements[0] = n11;
    this.elements[1] = n12;
    this.elements[2] = n13;
    this.elements[3] = n14;

    this.elements[4] = n21;
    this.elements[5] = n22;
    this.elements[6] = n23;
    this.elements[7] = n24;

    this.elements[8] = n31;
    this.elements[9] = n32;
    this.elements[10] = n33;
    this.elements[11] = n34;

    this.elements[12] = n41;
    this.elements[13] = n42;
    this.elements[14] = n43;
    this.elements[15] = n44;
  }

  // prettier-ignore
  invert(): this {
    const te = this.elements;

    const n11 = te[0],  n12 = te[1],  n13 = te[2],  n14 = te[3];
    const n21 = te[4],  n22 = te[5],  n23 = te[6],  n24 = te[7];
    const n31 = te[8],  n32 = te[9],  n33 = te[10], n34 = te[11];
    const n41 = te[12], n42 = te[13], n43 = te[14], n44 = te[15];

    const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
    const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
    const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
    const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const determinant = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (determinant === 0) return this;

    const di = 1 / determinant;

    te[0] = t11 * di;
    te[1] = t12 * di;
    te[2] = t13 * di;
    te[3] = t14 * di;
    te[4] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * di;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * di;
    te[6] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * di;
    te[7] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * di;
    te[8] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * di;
    te[9] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * di;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * di;
    te[11] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * di;
    te[12] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * di;
    te[13] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * di;
    te[14] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * di;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * di;

    return this;
  }

  compose(position: Vector3, rotation: Euler, scale: Vector3): this {
    const te = this.elements;

    const sx = Math.sin(rotation.x);
    const cx = Math.cos(rotation.x);
    const sy = Math.sin(rotation.y);
    const cy = Math.cos(rotation.y);
    const sz = Math.sin(rotation.z);
    const cz = Math.cos(rotation.z);

    const r00 = cy * cz;
    const r10 = cy * sz;
    const r20 = -sy;

    const r01 = cz * sy * sx - sz * cx;
    const r11 = sz * sy * sx + cz * cx;
    const r21 = cy * sx;

    const r02 = cz * sy * cx + sz * sx;
    const r12 = sz * sy * cx - cz * sx;
    const r22 = cy * cx;

    te[0] = r00 * scale.x;
    te[1] = r01 * scale.y;
    te[2] = r02 * scale.z;
    te[3] = position.x;

    te[4] = r10 * scale.x;
    te[5] = r11 * scale.y;
    te[6] = r12 * scale.z;
    te[7] = position.y;

    te[8] = r20 * scale.x;
    te[9] = r21 * scale.y;
    te[10] = r22 * scale.z;
    te[11] = position.z;

    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  composeInverse(position: Vector3, rotation: Euler, scale: Vector3): this {
    const te = this.elements;

    const sx = Math.sin(rotation.x);
    const cx = Math.cos(rotation.x);
    const sy = Math.sin(rotation.y);
    const cy = Math.cos(rotation.y);
    const sz = Math.sin(rotation.z);
    const cz = Math.cos(rotation.z);

    const invSx = scale.x !== 0 ? 1 / scale.x : 0;
    const invSy = scale.y !== 0 ? 1 / scale.y : 0;
    const invSz = scale.z !== 0 ? 1 / scale.z : 0;

    const r00 = cy * cz;
    const r10 = cy * sz;
    const r20 = -sy;
    const r01 = cz * sy * sx - sz * cx;
    const r11 = sz * sy * sx + cz * cx;
    const r21 = cy * sx;
    const r02 = cz * sy * cx + sz * sx;
    const r12 = sz * sy * cx - cz * sx;
    const r22 = cy * cx;

    te[0] = r00 * invSx;
    te[1] = r10 * invSx;
    te[2] = r20 * invSx;

    te[4] = r01 * invSy;
    te[5] = r11 * invSy;
    te[6] = r21 * invSy;

    te[8] = r02 * invSz;
    te[9] = r12 * invSz;
    te[10] = r22 * invSz;

    const px = position.x;
    const py = position.y;
    const pz = position.z;

    te[3] = -(te[0] * px + te[1] * py + te[2] * pz);
    te[7] = -(te[4] * px + te[5] * py + te[6] * pz);
    te[11] = -(te[8] * px + te[9] * py + te[10] * pz);

    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  writeBuffer(buffer: Float32Array, offset: number): this {
    buffer[offset + 0] = this.elements[0];
    buffer[offset + 1] = this.elements[4];
    buffer[offset + 2] = this.elements[8];
    buffer[offset + 3] = this.elements[12];

    buffer[offset + 4] = this.elements[1];
    buffer[offset + 5] = this.elements[5];
    buffer[offset + 6] = this.elements[9];
    buffer[offset + 7] = this.elements[13];

    buffer[offset + 8] = this.elements[2];
    buffer[offset + 9] = this.elements[6];
    buffer[offset + 10] = this.elements[10];
    buffer[offset + 11] = this.elements[14];

    buffer[offset + 12] = this.elements[3];
    buffer[offset + 13] = this.elements[7];
    buffer[offset + 14] = this.elements[11];
    buffer[offset + 15] = this.elements[15];

    return this;
  }
}
