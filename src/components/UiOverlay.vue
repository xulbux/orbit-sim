<template>
  <div class="pointer-events-none absolute top-3 left-3 lg:top-5 lg:left-5">
    <div
      class="pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-72 flex-col gap-6 overflow-y-auto rounded-xl border border-neutral-700/50 bg-neutral-900/80 p-6 pt-4.5 font-sans shadow-2xl backdrop-blur-md">
      <div class="inline-flex items-start justify-between">
        <h1 class="m-0 text-xl font-bold tracking-widest text-neutral-100 uppercase">Orbit Sim</h1>
        <OrbitIcon :size="20" class="mt-1 text-neutral-500" />
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-[0.7rem] font-bold tracking-tight text-neutral-50/60 uppercase">
          Simulation
        </label>
        <div class="flex gap-3">
          <button
            class="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-700/50 bg-neutral-800/75 px-3 py-2 font-semibold whitespace-nowrap text-neutral-100 outline-offset-2 outline-accent/40 transition-all hover:bg-neutral-800 focus-visible:outline-2 active:scale-97"
            @click="$emit('update:isPaused', !isPaused)">
            <PlayIcon v-if="isPaused" :size="16" class="text-neutral-400" />
            <PauseIcon v-else :size="16" class="text-neutral-400" />
            {{ isPaused ? 'Resume' : 'Pause' }}
          </button>
          <button
            class="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-700/50 bg-neutral-800/75 px-3 py-2 font-semibold whitespace-nowrap text-neutral-100 outline-offset-2 outline-accent/40 transition-all hover:bg-neutral-800 focus-visible:outline-2 active:scale-97"
            @click="$emit('clear')">
            <BrushCleaningIcon :size="16" class="text-neutral-400" />
            Clear
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-[0.7rem] font-bold tracking-tight text-neutral-50/60 uppercase">
          Spawn Mode
        </label>
        <button
          role="switch"
          :aria-checked="spawnMode === BodyType.BLACK_HOLE"
          class="inline-flex w-full cursor-pointer rounded-md outline-offset-2 outline-accent/40 transition-all focus-visible:outline-2 active:scale-97"
          @click="
            $emit(
              'update:spawnMode',
              spawnMode === BodyType.PLANET ? BodyType.BLACK_HOLE : BodyType.PLANET
            )
          ">
          <span
            class="inline-flex w-full items-center justify-center gap-2 rounded-l-md border px-3 py-2 text-center font-bold whitespace-nowrap transition-all"
            :class="
              spawnMode === BodyType.PLANET
                ? 'border-neutral-200 bg-neutral-200 text-neutral-900 [&_svg]:text-neutral-600'
                : 'border-neutral-700/50 bg-neutral-800/75 text-neutral-100 hover:bg-neutral-800 [&_svg]:text-neutral-400'
            ">
            <EarthIcon :size="16" />
            Planet
          </span>
          <span
            class="inline-flex items-center justify-center gap-2 rounded-r-md border px-3 py-2 text-center font-bold whitespace-nowrap transition-all"
            :class="
              spawnMode === BodyType.BLACK_HOLE
                ? 'border-neutral-200 bg-neutral-200 text-neutral-900 [&_svg]:text-neutral-600'
                : 'border-neutral-700/50 bg-neutral-800/75 text-neutral-100 hover:bg-neutral-800 [&_svg]:text-neutral-400'
            ">
            <RadiationIcon :size="16" />
            Black Hole
          </span>
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <div class="inline-flex items-center justify-between">
          <label
            class="inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-tight text-neutral-50/60 uppercase">
            <MagnetIcon :size="14.5" />
            Gravity Constant
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ gravitationalConstant }}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          class="w-full cursor-pointer rounded accent-neutral-400 outline-offset-4 outline-accent/40 focus-visible:outline-2"
          :value="gravitationalConstant"
          @input="
            $emit('update:gravitationalConstant', Number(($event.target as HTMLInputElement).value))
          " />
      </div>

      <div class="flex flex-col gap-2">
        <div class="inline-flex items-center justify-between">
          <label
            class="inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-tight text-neutral-50/60 uppercase">
            <ClockArrowUpIcon :size="14.5" />
            Time Scale
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ timeScale.toFixed(1) }}×</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          class="w-full cursor-pointer rounded accent-neutral-400 outline-offset-4 outline-accent/40 focus-visible:outline-2"
          :value="timeScale"
          @input="$emit('update:timeScale', Number(($event.target as HTMLInputElement).value))" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="inline-flex items-center justify-between">
          <label
            class="inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-tight text-neutral-50/60 uppercase">
            <WeightIcon :size="14.5" />
            New Object Mass
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ objMass }}</span>
        </div>
        <input
          type="range"
          min="10"
          max="5000"
          step="10"
          class="w-full cursor-pointer rounded accent-neutral-400 outline-offset-4 outline-accent/40 focus-visible:outline-2"
          :value="objMass"
          @input="$emit('update:objMass', Number(($event.target as HTMLInputElement).value))" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="inline-flex items-center justify-between">
          <label
            class="inline-flex items-center gap-1.5 text-[0.7rem] font-bold tracking-tight text-neutral-50/60 uppercase">
            <RadiusIcon :size="14.5" />
            New Object Radius
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ objRadius }}</span>
        </div>
        <input
          type="range"
          min="2"
          max="50"
          step="1"
          class="w-full cursor-pointer rounded accent-neutral-400 outline-offset-4 outline-accent/40 focus-visible:outline-2"
          :value="objRadius"
          @input="$emit('update:objRadius', Number(($event.target as HTMLInputElement).value))" />
      </div>

      <div class="mt-2 flex flex-row justify-between text-[0.7rem] text-neutral-50/40">
        <p class="inline-flex items-center gap-1.25"><HandIcon :size="13" /> Drag to Pan</p>
        <p class="inline-flex items-center gap-1">
          <MouseIcon :size="13" /> Pinch / Scroll to Zoom
        </p>
      </div>
    </div>
  </div>

  <div
    class="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 pt-1 pb-px font-mono leading-none backdrop-blur-md lg:top-5 lg:right-5">
    <span class="text-lg font-semibold">{{ bodyCount }}</span>
    <span class="text-sm text-neutral-50/60">{{ bodyCount === 1 ? 'OBJ' : 'OBJS' }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  BrushCleaningIcon,
  ClockArrowUpIcon,
  EarthIcon,
  HandIcon,
  MagnetIcon,
  MouseIcon,
  OrbitIcon,
  PauseIcon,
  PlayIcon,
  RadiationIcon,
  RadiusIcon,
  WeightIcon,
} from '@lucide/vue';
import { BodyType } from '@/physics/body';

defineProps<{
  bodyCount: number;
  gravitationalConstant: number;
  isPaused: boolean;
  objMass: number;
  objRadius: number;
  spawnMode: BodyType;
  timeScale: number;
}>();

defineEmits<{
  (event: 'clear'): void;
  (
    event:
      | 'update:gravitationalConstant'
      | 'update:objMass'
      | 'update:objRadius'
      | 'update:timeScale',
    value: number
  ): void;
  (event: 'update:isPaused', value: boolean): void;
  (event: 'update:spawnMode', value: BodyType): void;
}>();
</script>
