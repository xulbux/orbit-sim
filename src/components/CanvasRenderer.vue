<template>
  <div ref="containerRef" class="h-full w-full" :class="cursorClass">
    <canvas
      ref="canvasRef"
      class="block"
      @click="handleClick"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Matrix3 } from '@/math/matrix3';
import { Vector2 } from '@/math/vector2';
import { Body, BodyType } from '@/physics/body';
import { Engine } from '@/physics/engine';

const { engine } = defineProps<{ engine: Engine }>();

const emit = defineEmits<{ (event: 'canvasClick', worldPosition: Vector2): void }>();

const canvasRef = ref<HTMLCanvasElement | undefined>();
const containerRef = ref<HTMLDivElement | undefined>();

// Camera state
const cameraTransform = ref(Matrix3.identity());
const zoomLevel = ref(1);
const cameraOffset = ref(new Vector2(0, 0));

// Panning and State
const isSpacePressed = ref(false);
const isDragging = ref(false);
let hasDragged = false;
let lastMousePosition = new Vector2(0, 0);

const cursorClass = computed(() => {
  if (isSpacePressed.value) {
    return isDragging.value ? 'cursor-grabbing' : 'cursor-grab';
  }
  return 'cursor-crosshair';
});

function updateCamera(): void {
  if (!canvasRef.value) {
    return;
  }
  const canvasWidth = canvasRef.value.width;
  const canvasHeight = canvasRef.value.height;

  // Center of screen + offset + zoom
  const translationMatrix = Matrix3.translation(
    canvasWidth / 2 + cameraOffset.value.x,
    canvasHeight / 2 + cameraOffset.value.y
  );
  const scaleMatrix = Matrix3.scale(zoomLevel.value, zoomLevel.value);

  cameraTransform.value = translationMatrix.multiply(scaleMatrix);
}

function createPlanetTexture(body: Body): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  const hueMatch = body.color.match(/hsl\((?<hue>\d+)/);
  const baseHue = hueMatch?.groups?.hue
    ? Number.parseInt(hueMatch.groups.hue, 10)
    : Math.floor(body.seed * 360);

  // Make colors highly saturated and distinct
  const color1 = `hsl(${(baseHue + 35) % 360}, 95%, 50%)`;
  const color2 = `hsl(${(baseHue - 35 + 360) % 360}, 95%, 50%)`;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 128, 128);

  // True chaotic pseudo-random noise hash (GLSL style)
  function getHash(seedValue: number) {
    const x = Math.sin(body.seed * 12.9898 + seedValue * 78.233) * 43_758.5453;
    return x - Math.floor(x);
  }

  // Draw granular noise blobs
  const numBlobs = 600;
  for (let idx = 0; idx < numBlobs; idx += 1) {
    ctx.beginPath();
    ctx.globalAlpha = getHash(idx) * 0.3 + 0.05;
    const posX = getHash(idx + 1) * 128;
    const posY = getHash(idx + 2) * 128;
    const blobRadius = getHash(idx + 3) * 8 + 1;
    ctx.arc(posX, posY, blobRadius, 0, Math.PI * 2);
    ctx.fillStyle = color2;
    ctx.fill();
  }
  return canvas;
}

const planetTextures = new Map<Body, HTMLCanvasElement>();

// Cached background pattern for performance
const cachedPatternCanvas = document.createElement('canvas');
let cachedScreenSpacing = 0;
let cachedDotScreenSize = 0;

function draw(): void {
  const canvasElement = canvasRef.value;
  if (!canvasElement) {
    return;
  }
  const context = canvasElement.getContext('2d');
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  const matrix = cameraTransform.value;

  // Draw subtle background grid dots
  let worldSpacing = 50;
  let screenSpacing = worldSpacing * zoomLevel.value;

  // Dynamically scale up the grid spacing if it gets too dense (prevents moire and lag)
  while (screenSpacing < 15) {
    worldSpacing *= 2;
    screenSpacing = worldSpacing * zoomLevel.value;
  }

  // Make the dots physically smaller as you zoom out (0.5px minimum)
  const dotScreenSize = Math.max(0.5, 2 * zoomLevel.value);

  // Only recreate the pattern canvas if the zoom level meaningfully changed the spacing or dot size
  if (cachedScreenSpacing !== screenSpacing || cachedDotScreenSize !== dotScreenSize) {
    cachedScreenSpacing = screenSpacing;
    cachedDotScreenSize = dotScreenSize;

    cachedPatternCanvas.width = screenSpacing;
    cachedPatternCanvas.height = screenSpacing;
    const pCtx = cachedPatternCanvas.getContext('2d');
    if (pCtx) {
      pCtx.clearRect(0, 0, screenSpacing, screenSpacing);
      pCtx.fillStyle = 'rgba(255 255 255 / 0.1)';
      pCtx.beginPath();
      pCtx.arc(screenSpacing / 2, screenSpacing / 2, dotScreenSize, 0, Math.PI * 2);
      pCtx.fill();
    }
  }

  const pattern = context.createPattern(cachedPatternCanvas, 'repeat');
  if (pattern) {
    context.save();
    // Anchor the pattern mathematically so world (0,0) perfectly aligns with a dot
    const originScreen = matrix.multiplyVector(new Vector2(0, 0));
    const offsetX = (originScreen.x % screenSpacing) - screenSpacing / 2;
    const offsetY = (originScreen.y % screenSpacing) - screenSpacing / 2;

    context.translate(offsetX, offsetY);
    context.fillStyle = pattern;
    // Draw pattern well past the edges to cover screen during panning
    context.fillRect(
      -screenSpacing * 2,
      -screenSpacing * 2,
      canvasElement.width + screenSpacing * 4,
      canvasElement.height + screenSpacing * 4
    );
    context.restore();
  }

  // [1] Draw all trails first
  for (const body of engine.bodies) {
    if (body.trail.length > 1) {
      const trailLength = body.trail.length;
      context.lineWidth = Math.max(1, 2 * zoomLevel.value);

      for (let trailIndex = 0; trailIndex < trailLength - 1; trailIndex += 1) {
        const point1 = matrix.multiplyVector(body.trail[trailIndex]);
        const point2 = matrix.multiplyVector(body.trail[trailIndex + 1]);

        context.beginPath();
        context.moveTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);

        const opacity = (trailIndex / trailLength) * 0.9;
        context.strokeStyle = body.color;
        context.globalAlpha = opacity;
        context.stroke();
      }
      context.globalAlpha = 1;
    }
  }

  // [2] Draw black holes
  for (const body of engine.bodies) {
    if (body.type === BodyType.BLACK_HOLE) {
      const screenPosition = matrix.multiplyVector(body.position);
      const screenRadius = body.radius * zoomLevel.value;

      const outerGlowRadius = screenRadius * 12;
      const outerGlow = context.createRadialGradient(
        screenPosition.x,
        screenPosition.y,
        screenRadius,
        screenPosition.x,
        screenPosition.y,
        outerGlowRadius
      );
      outerGlow.addColorStop(0, 'rgba(255 120 50 / 0.25)');
      outerGlow.addColorStop(0.2, 'rgba(200 50 0 / 0.05)');
      outerGlow.addColorStop(1, 'transparent');

      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, outerGlowRadius, 0, Math.PI * 2);
      context.fillStyle = outerGlow;
      context.fill();

      const time = Date.now() / 1000;
      const flicker = Math.sin(time * 15) * 0.05;
      const innerGlowRadius = screenRadius * 1.4;
      const innerGlow = context.createRadialGradient(
        screenPosition.x,
        screenPosition.y,
        screenRadius * 0.95,
        screenPosition.x,
        screenPosition.y,
        innerGlowRadius
      );

      const brightAlpha = Math.max(0, Math.min(1, 0.85 + flicker * 1.5));
      innerGlow.addColorStop(0, `rgba(255 255 255 / ${brightAlpha})`);
      innerGlow.addColorStop(0.3, `rgba(255 220 150 / ${brightAlpha * 0.9})`);
      innerGlow.addColorStop(1, 'transparent');

      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, innerGlowRadius, 0, Math.PI * 2);
      context.fillStyle = innerGlow;
      context.fill();

      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, screenRadius, 0, Math.PI * 2);
      context.fillStyle = '#000000';
      context.fill();
    }
  }

  // [3] Draw planets
  for (const body of engine.bodies) {
    if (body.type === BodyType.PLANET && !body.isConsumed) {
      const screenPosition = matrix.multiplyVector(body.position);
      const screenRadius = body.radius * zoomLevel.value;

      // Alpha fade as it sinks into black hole
      const alpha = body.radius / body.originalRadius;
      context.globalAlpha = Math.max(0, Math.min(1, alpha));

      context.save();

      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, screenRadius, 0, Math.PI * 2);
      context.clip();

      if (!planetTextures.has(body)) {
        planetTextures.set(body, createPlanetTexture(body));
      }
      const texture = planetTextures.get(body);
      if (texture) {
        context.drawImage(
          texture,
          screenPosition.x - screenRadius,
          screenPosition.y - screenRadius,
          screenRadius * 2,
          screenRadius * 2
        );
      }

      const gradient = context.createRadialGradient(
        screenPosition.x - screenRadius * 0.4,
        screenPosition.y - screenRadius * 0.4,
        screenRadius * 0.05,
        screenPosition.x,
        screenPosition.y,
        screenRadius * 1.2
      );
      gradient.addColorStop(0, 'rgba(255 255 255 / 0.8)');
      gradient.addColorStop(0.2, 'rgba(255 255 255 / 0)');
      gradient.addColorStop(0.3, 'rgba(0 0 0 / 0)');
      gradient.addColorStop(1, 'rgba(0 0 0 / 0.9)');

      context.beginPath();
      context.arc(screenPosition.x, screenPosition.y, screenRadius, 0, Math.PI * 2);
      context.fillStyle = gradient;
      context.fill();

      context.restore();
      context.globalAlpha = 1;
    }
  }

  requestAnimationFrame(draw);
}

function handleResize(): void {
  if (canvasRef.value && containerRef.value) {
    canvasRef.value.width = containerRef.value.clientWidth;
    canvasRef.value.height = containerRef.value.clientHeight;
    updateCamera();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code === 'Space') {
    isSpacePressed.value = true;
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.code === 'Space') {
    isSpacePressed.value = false;
  }
}

function handleClick(event: MouseEvent): void {
  if (!canvasRef.value) {
    return;
  }

  // Prevent spawning a planet if we were panning or if Space is held
  if (hasDragged || isSpacePressed.value) {
    hasDragged = false;
    return;
  }

  const boundingRectangle = canvasRef.value.getBoundingClientRect();
  const screenX = event.clientX - boundingRectangle.left;
  const screenY = event.clientY - boundingRectangle.top;
  const screenPosition = new Vector2(screenX, screenY);

  // INVERSE MATRIX usage
  const inverseMatrix = cameraTransform.value.invert();
  if (inverseMatrix) {
    const worldPosition = inverseMatrix.multiplyVector(screenPosition);
    emit('canvasClick', worldPosition);
  }
}

function handleMouseDown(event: MouseEvent): void {
  if (event.button === 1 || (event.button === 0 && isSpacePressed.value)) {
    // Middle mouse or Space+Left
    isDragging.value = true;
    hasDragged = false;
    lastMousePosition = new Vector2(event.clientX, event.clientY);
    event.preventDefault();
  }
}

function handleMouseMove(event: MouseEvent): void {
  if (isDragging.value) {
    hasDragged = true;
    const currentPosition = new Vector2(event.clientX, event.clientY);
    const movementDelta = currentPosition.sub(lastMousePosition);
    cameraOffset.value = cameraOffset.value.add(movementDelta);
    lastMousePosition = currentPosition;
    updateCamera();
  }
}

function handleMouseUp(): void {
  isDragging.value = false;
}

function handleWheel(event: WheelEvent): void {
  if (!canvasRef.value) {
    return;
  }

  const zoomSensitivity = 0.001;
  const zoomDelta = -event.deltaY * zoomSensitivity;

  const boundingRectangle = canvasRef.value.getBoundingClientRect();
  const screenX = event.clientX - boundingRectangle.left;
  const screenY = event.clientY - boundingRectangle.top;
  const screenPosition = new Vector2(screenX, screenY);

  const inverseMatrixBefore = cameraTransform.value.invert();
  if (!inverseMatrixBefore) {
    return;
  }

  const worldPosUnderMouse = inverseMatrixBefore.multiplyVector(screenPosition);

  zoomLevel.value = Math.max(0.1, Math.min(10, zoomLevel.value + zoomDelta));

  const canvasWidth = canvasRef.value.width;
  const canvasHeight = canvasRef.value.height;
  const center = new Vector2(canvasWidth / 2, canvasHeight / 2);

  // Offset = TargetScreenPos - Center - WorldPos * NewZoom
  cameraOffset.value = screenPosition.sub(center).sub(worldPosUnderMouse.multiply(zoomLevel.value));

  updateCamera();
}

onMounted(() => {
  handleResize();
  globalThis.addEventListener('resize', handleResize);
  globalThis.addEventListener('keydown', handleKeyDown);
  globalThis.addEventListener('keyup', handleKeyUp);
  draw();
});

onUnmounted(() => {
  globalThis.removeEventListener('resize', handleResize);
  globalThis.removeEventListener('keydown', handleKeyDown);
  globalThis.removeEventListener('keyup', handleKeyUp);
});
</script>
