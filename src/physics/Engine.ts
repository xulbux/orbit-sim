import { Vector2 } from '@/math/Vector2';
import { type Body, BodyType } from './Body';

export class Engine {
  public bodies: Body[] = [];
  public gravitationalConstant = 100; // Gravitational constant
  public timeScale = 1;

  public addBody(body: Body): void {
    this.bodies.push(body);
  }

  public update(deltaTime: number): void {
    const scaledDeltaTime = deltaTime * this.timeScale;
    const bodiesToRemove = new Set<Body>();

    // Calculate forces
    for (let bodyIndex1 = 0; bodyIndex1 < this.bodies.length; bodyIndex1 += 1) {
      for (let bodyIndex2 = 0; bodyIndex2 < this.bodies.length; bodyIndex2 += 1) {
        const body1 = this.bodies[bodyIndex1];
        const body2 = this.bodies[bodyIndex2];

        if (bodyIndex1 === bodyIndex2 || body1.isConsumed || body2.isConsumed) {
          // Skip self or consumed bodies
        } else {
          const distance = body1.position.distanceTo(body2.position);

          if (body1.type === BodyType.PLANET && body2.type === BodyType.BLACK_HOLE) {
            // Start shrinking just outside the event horizon
            const shrinkRadius = body2.radius * 1.5;
            if (distance < shrinkRadius) {
              const normalizedDistance = Math.max(0, distance / shrinkRadius);
              // quadratic scale for visible shrinking
              const scale = normalizedDistance ** 2;
              body1.radius = body1.originalRadius * scale;

              if (distance < body2.radius * 0.1) {
                // Mark as consumed instead of deleting immediately so the trail can fade
                body1.isConsumed = true;
              }
            } else {
              body1.radius = body1.originalRadius;
            }
          }

          const force = this.calculateGravity(body1, body2);
          body1.applyForce(force);

          // Special Black Hole logic
          if (body2.type === BodyType.BLACK_HOLE) {
            Engine.applyBlackHoleSpiral(body1, body2, scaledDeltaTime);
          }
        }
      }
    }

    // Update positions and handle consumed trails
    for (const body of this.bodies) {
      if (body.isConsumed) {
        // Drain the trail array to let it visually catch up to the black hole
        body.trail.shift();
        body.trail.shift();
        if (body.trail.length <= 1) {
          bodiesToRemove.add(body);
        }
      } else {
        body.update(scaledDeltaTime);
      }
    }

    // Remove consumed bodies
    if (bodiesToRemove.size > 0) {
      this.bodies = this.bodies.filter((body) => !bodiesToRemove.has(body));
    }
  }

  public calculateGravity(body1: Body, body2: Body): Vector2 {
    const relativeVector = body2.position.sub(body1.position);
    const radiusSquared = relativeVector.magnitudeSq();
    const radius = Math.sqrt(radiusSquared);

    let effectiveRadius = radius;
    if (body1.type === BodyType.BLACK_HOLE || body2.type === BodyType.BLACK_HOLE) {
      // Cap the minimum radius to the black hole's radius to prevent extreme slingshotting at the singularity
      effectiveRadius = Math.max(radius, Math.max(body1.radius, body2.radius));
    } else {
      if (radius < body1.radius + body2.radius) {
        // Planet collision
        return new Vector2(0, 0);
      }
    }

    // F = G * (m1 * m2) / r^2
    const forceMagnitude =
      (this.gravitationalConstant * body1.mass * body2.mass) / (effectiveRadius * effectiveRadius);
    return relativeVector.normalize().multiply(forceMagnitude);
  }

  public static applyBlackHoleSpiral(body: Body, blackHole: Body, deltaTime: number): void {
    const relativeVector = blackHole.position.sub(body.position);
    const distance = relativeVector.magnitude();
    const effectRadius = blackHole.radius * 10;

    // If close enough to black hole, simulate accretion disk drag
    if (distance < effectRadius) {
      // Calculate how close the planet is (0 at edge, 1 at center)
      const proximity = 1 - distance / effectRadius;

      // Apply accretion disk drag (friction) so gravity can pull it in naturally in a spiral
      // The drag slows down its tangential velocity, causing the orbit to decay
      const dragAmount = proximity * 0.5 * deltaTime;
      body.velocity = body.velocity.multiply(1 - Math.min(1, dragAmount));

      // Once a planet crosses the event horizon, it cannot escape.
      // Force its velocity strictly towards the singularity to prevent orbiting out the other side.
      if (distance < blackHole.radius) {
        let speed = body.velocity.magnitude();

        // Prevent overshooting the black hole center and slow down the fall
        // to allow the shrinking animation to play over roughly ~30 frames (0.5s)
        const maxSpeed = (blackHole.radius * 0.03) / Math.max(0.001, deltaTime);
        if (speed > maxSpeed) {
          speed = maxSpeed;
        }

        body.velocity = relativeVector.normalize().multiply(speed);
      }
    }
  }

  public clear(): void {
    this.bodies = [];
  }
}

export default Engine;
