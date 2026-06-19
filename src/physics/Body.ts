import { Vector2 } from '@/math/Vector2';

enum BodyType {
  PLANET = 'PLANET',
  BLACK_HOLE = 'BLACK_HOLE',
}

class Body {
  public position: Vector2;
  public velocity: Vector2;
  public acceleration: Vector2;
  public mass: number;
  public radius: number;
  public originalRadius: number;
  public type: BodyType;
  public color: string;
  public seed: number;
  public isConsumed = false;
  public trail: Vector2[] = [];
  public maxTrailLength = 300;

  public constructor(
    position: Vector2,
    velocity: Vector2,
    mass: number,
    radius: number,
    type: BodyType = BodyType.PLANET,
    color = '#4cc9f0'
  ) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = new Vector2(0, 0);
    this.mass = mass;
    this.radius = radius;
    this.originalRadius = radius;
    this.type = type;
    this.color = color;
    this.seed = Math.random();
  }

  public update(deltaTime: number): void {
    if (this.type === BodyType.BLACK_HOLE) {
      // Black holes stay fixed in this simulation for simplicity
      // or we could let them move if desired.
      // For now, let's keep them fixed.
      return;
    }

    // Euler integration
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Add to trail
    this.trail.push(this.position.clone());
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Reset acceleration for next frame
    this.acceleration = new Vector2(0, 0);
  }

  public applyForce(force: Vector2): void {
    // F = ma => a = F/m
    this.acceleration = this.acceleration.add(force.divide(this.mass));
  }
}

export { Body, BodyType };
