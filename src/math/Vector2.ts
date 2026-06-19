export class Vector2 {
  public x: number;
  public y: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public add(vector: Vector2): Vector2 {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  public sub(vector: Vector2): Vector2 {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public divide(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  public dot(vector: Vector2): number {
    return this.x * vector.x + this.y * vector.y;
  }

  public magnitudeSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  public magnitude(): number {
    return Math.sqrt(this.magnitudeSq());
  }

  public normalize(): Vector2 {
    const mag = this.magnitude();
    return mag === 0 ? new Vector2() : this.divide(mag);
  }

  public distanceTo(vector: Vector2): number {
    return this.sub(vector).magnitude();
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

export default Vector2;
