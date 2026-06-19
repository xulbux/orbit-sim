import { Vector2 } from './Vector2';

/**
 * A 3x3 Matrix for 2D affine transformations.
 * Layout:
 * [ m0 m3 m6 ]
 * [ m1 m4 m7 ]
 * [ m2 m5 m8 ]
 */
export class Matrix3 {
  public elements: Float32Array;

  public constructor(elements?: Float32Array) {
    this.elements = elements || new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  public static identity(): Matrix3 {
    return new Matrix3();
  }

  public multiply(matrix: Matrix3): Matrix3 {
    const ae = this.elements;
    const be = matrix.elements;
    const te = new Float32Array(9);

    const [a11, a21, a31, a12, a22, a32, a13, a23, a33] = ae;
    const [b11, b21, b31, b12, b22, b32, b13, b23, b33] = be;

    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;

    return new Matrix3(te);
  }

  public multiplyVector(vector: Vector2): Vector2 {
    const elementsArray = this.elements;
    // Assuming v.z is 1 for position transformations
    const x = elementsArray[0] * vector.x + elementsArray[3] * vector.y + elementsArray[6];
    const y = elementsArray[1] * vector.x + elementsArray[4] * vector.y + elementsArray[7];
    // We ignore the w component for Vector2 positions
    return new Vector2(x, y);
  }

  public static translation(x: number, y: number): Matrix3 {
    return new Matrix3(new Float32Array([1, 0, 0, 0, 1, 0, x, y, 1]));
  }

  public static rotation(theta: number): Matrix3 {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return new Matrix3(new Float32Array([cos, sin, 0, -sin, cos, 0, 0, 0, 1]));
  }

  public static scale(sx: number, sy: number): Matrix3 {
    return new Matrix3(new Float32Array([sx, 0, 0, 0, sy, 0, 0, 0, 1]));
  }

  public invert(): Matrix3 | undefined {
    const te = this.elements;
    const [n11, n21, n31, n12, n22, n32, n13, n23, n33] = te;

    const t11 = n33 * n22 - n32 * n23;
    const t12 = n32 * n13 - n33 * n12;
    const t13 = n23 * n12 - n22 * n13;

    const det = n11 * t11 + n21 * t12 + n31 * t13;

    if (det === 0) {
      return undefined;
    }

    const detInv = 1 / det;
    const res = new Float32Array(9);

    res[0] = t11 * detInv;
    res[1] = (n31 * n23 - n33 * n21) * detInv;
    res[2] = (n32 * n21 - n31 * n22) * detInv;

    res[3] = t12 * detInv;
    res[4] = (n33 * n11 - n31 * n13) * detInv;
    res[5] = (n31 * n12 - n32 * n11) * detInv;

    res[6] = t13 * detInv;
    res[7] = (n21 * n13 - n23 * n11) * detInv;
    res[8] = (n22 * n11 - n21 * n12) * detInv;

    return new Matrix3(res);
  }
}

export default Matrix3;
