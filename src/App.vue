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
      @clear="engine.clear()" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import CanvasRenderer from './components/CanvasRenderer.vue';
import UiOverlay from './components/UiOverlay.vue';
import { Complex } from './math/Complex';
import { Vector2 } from './math/Vector2';
import { Body, BodyType } from './physics/Body';
import { Engine } from './physics/Engine';

const engine = reactive(new Engine());
const isPaused = ref(false);
const spawnMode = ref(BodyType.PLANET);
const objMass = ref(100);
const objRadius = ref(10);

const lastTime = ref(0);

function update(time: number): void {
  if (!isPaused.value) {
    const deltaTime = (time - lastTime.value) / 1000;
    if (deltaTime < 0.1) {
      // Cap dt to avoid huge jumps
      engine.update(deltaTime);
    }
  }
  lastTime.value = time;
  requestAnimationFrame(update);
}

function handleCanvasClick(worldPosition: Vector2): void {
  const bodyColor =
    spawnMode.value === BodyType.PLANET
      ? `hsl(${Math.floor(Math.random() * 360)}, 85%, 65%)`
      : '#f72585';
  const bodyMass = spawnMode.value === BodyType.PLANET ? objMass.value : objMass.value * 10;
  const bodyRadius = spawnMode.value === BodyType.PLANET ? objRadius.value : objRadius.value * 2;

  // For planets, give them some initial tangential velocity for an orbit
  let initialVelocity = new Vector2(0, 0);
  if (spawnMode.value === BodyType.PLANET && engine.bodies.length > 0) {
    // Simple heuristic: find nearest body and rotate vector to it by 90 deg
    const [centralBody] = engine.bodies;
    const toCenter = centralBody.position.sub(worldPosition);
    const distance = toCenter.magnitude();
    const speed = Math.sqrt((engine.gravitationalConstant * centralBody.mass) / distance);

    // Rotate 90 degrees using complex rotation to get tangential velocity
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
