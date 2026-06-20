import { Vector2 } from './vector2';

export class Complex {
  public real: number;
  public imaginary: number;

  public constructor(real = 0, imaginary = 0) {
    this.real = real;
    this.imaginary = imaginary;
  }

  public add(complex: Complex): Complex {
    return new Complex(this.real + complex.real, this.imaginary + complex.imaginary);
  }

  public sub(complex: Complex): Complex {
    return new Complex(this.real - complex.real, this.imaginary - complex.imaginary);
  }

  public multiply(complex: Complex): Complex {
    return new Complex(
      this.real * complex.real - this.imaginary * complex.imaginary,
      this.real * complex.imaginary + this.imaginary * complex.real
    );
  }

  public multiplyScalar(scalar: number): Complex {
    return new Complex(this.real * scalar, this.imaginary * scalar);
  }

  public magnitude(): number {
    return Math.hypot(this.real, this.imaginary);
  }

  public static fromAngle(theta: number): Complex {
    return new Complex(Math.cos(theta), Math.sin(theta));
  }

  public static fromVector2(vector: Vector2): Complex {
    return new Complex(vector.x, vector.y);
  }

  public toVector2(): Vector2 {
    return new Vector2(this.real, this.imaginary);
  }

  /** Rotates a `Vector2` by an angle using complex multiplication. */
  public static rotateVector(vector: Vector2, theta: number): Vector2 {
    const complexVector = Complex.fromVector2(vector);
    const rotator = Complex.fromAngle(theta);
    return complexVector.multiply(rotator).toVector2();
  }
}

export default Complex;
