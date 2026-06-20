<template>
  <div class="relative h-screen w-full overflow-hidden bg-space-black font-sans text-white">
    <CanvasRenderer :engine @canvas-click="handleCanvasClick" />
    <UiOverlay
      v-model:gravitationalConstant="engine.gravitationalConstant"
      v-model:isPaused="isPaused"
      v-model:objMass="objMass"
      v-model:objRadius="objRadius"
      v-model:spawnMode="spawnMode"
      v-model:timeScale="engine.timeScale"
      :body-count="bodyCount"
      @clear="engine.clear()" />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowReactive, onMounted } from 'vue';
import CanvasRenderer from '@/components/CanvasRenderer.vue';
import UiOverlay from '@/components/UiOverlay.vue';
import { Complex } from '@/math/complex.ts';
import { Vector2 } from '@/math/vector2.ts';
import { Body, BodyType } from '@/physics/body.ts';
import { Engine } from '@/physics/engine.ts';

const engine = shallowReactive(new Engine());
const isPaused = ref(false);
const spawnMode = ref(BodyType.PLANET);
const objMass = ref(100);
const objRadius = ref(20);

const lastTime = ref(0);
const bodyCount = ref(0);

function update(time: number): void {
  if (!isPaused.value) {
    const deltaTime = (time - lastTime.value) / 1000;

    if (deltaTime < 0.1) {
      // Cap delta time to avoid huge jumps
      engine.update(deltaTime);
    }
  }

  lastTime.value = time;
  bodyCount.value = engine.bodies.length;

  requestAnimationFrame(update);
}

function handleCanvasClick(worldPosition: Vector2): void {
  const bodyColor =
    spawnMode.value === BodyType.PLANET
      ? `hsl(${Math.floor(Math.random() * 360)}, 85%, 65%)`
      : '#000';
  const bodyMass = spawnMode.value === BodyType.PLANET ? objMass.value : objMass.value * 10;
  const bodyRadius =
    (spawnMode.value === BodyType.PLANET ? objRadius.value : objRadius.value * 2.5) * 1.5;

  // For planets, give them some initial tangential velocity for an orbit
  let initialVelocity = new Vector2(0, 0);
  if (spawnMode.value === BodyType.PLANET && engine.bodies.length > 0) {
    // Simple heuristic: find nearest body and rotate vector to it by 90°
    const [centralBody] = engine.bodies;
    const toCenter = centralBody.position.sub(worldPosition);
    const distance = toCenter.magnitude();
    const speed = Math.sqrt((engine.gravitationalConstant * centralBody.mass) / distance);

    // Rotate 90° using complex rotation to get tangential velocity
    initialVelocity = Complex.rotateVector(toCenter, Math.PI / 2)
      .normalize()
      .multiply(speed);
  }

  engine.addBody(
    new Body(worldPosition, initialVelocity, bodyMass, bodyRadius, spawnMode.value, bodyColor)
  );
}

onMounted(() => requestAnimationFrame(update));
</script>
