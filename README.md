# Orbit Sim<a href="#orbit-sim"><img align="right" width="34" src="https://github.com/xulbux/orbit-sim/blob/main/public/favicon.svg?raw=true"></a>

A mesmerizing, high-performance 2D sandbox for simulating gravity, black holes, and orbital mechanics. Built entirely from scratch without external physics libraries.

### **<a href="https://xulbux.github.io/orbit-sim" target="_blank">Play the Live Demo here!</a>**

<br>
<br>

## Features

-   **N-Body Gravity Simulation:** Calculates real-time gravitational pull between all celestial bodies using [Newton's laws of universal gravitation](https://github.com/xulbux/orbit-sim/blob/main/src/physics/engine.ts#L47).
-   **Black Holes:** Spawn singularities that consume matter, featuring [custom accretion disk drag](https://github.com/xulbux/orbit-sim/blob/main/src/physics/engine.ts#L100) and chaotic, sputtering core rendering.
-   **Perfect Orbits:** New planets are [mathematically assigned the exact tangential velocity](https://github.com/xulbux/orbit-sim/blob/main/src/App.vue#L66) needed to form a stable orbit.
-   **Infinite Canvas:** Pan and zoom seamlessly through space using [custom affine transformations](https://github.com/xulbux/orbit-sim/blob/main/src/components/CanvasRenderer.vue#L351).
-   **GPU Optimized:** Maintains 60 FPS even when zoomed out, using a [dynamically scaling, GPU-cached background grid](https://github.com/xulbux/orbit-sim/blob/main/src/components/CanvasRenderer.vue#L107).

## Tech Stack

-   **Vue 3** & **TypeScript**
-   **Tailwind CSS v4** (for UI styling)
-   **Vite** (Build tool)
-   **Lucide Icons**

## Custom Physics Engine

Instead of relying on existing frameworks like Matter.js, this project features a bespoke physics engine built from mathematical first principles:

-   **Euler Integration:** The simulation [continuously integrates velocity and position](https://github.com/xulbux/orbit-sim/blob/main/src/physics/engine.ts#L13) frame-by-frame.
-   **Custom Linear Algebra:** Dedicated classes for [2D Vectors](https://github.com/xulbux/orbit-sim/blob/main/src/math/vector2.ts#L1), [3×3 Matrices](https://github.com/xulbux/orbit-sim/blob/main/src/math/matrix3.ts#L10), and [Complex Numbers](https://github.com/xulbux/orbit-sim/blob/main/src/math/complex.ts#L3).
-   **Complex Rotations:** To calculate perfect orbital velocities, position vectors are [rotated by exactly $90^\circ$](https://github.com/xulbux/orbit-sim/blob/main/src/math/complex.ts#L48) by translating them into the complex plane and multiplying by $i$.
-   **Affine Transformations:** Screen coordinates are mapped back into the infinite world space by computing the **Determinant** and **Inverse** of the camera's [3×3 transformation matrix](https://github.com/xulbux/orbit-sim/blob/main/src/math/matrix3.ts#L67).

<br>
<br>

## Resources & Theory

-   [Euler method for numerical integration](https://en.wikipedia.org/wiki/Euler_method)
-   [Understanding Complex Multiplication for rotations](https://betterexplained.com/articles/understanding-why-complex-multiplication-works)
-   [3×3 Matrix Inverses & Determinants](https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html)
-   [Newton's Law of Universal Gravitation](https://www.physicsclassroom.com/class/circles/Lesson-3/Newton-s-Law-of-Universal-Gravitation)
