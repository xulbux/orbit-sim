<template>
  <div class="pointer-events-none absolute top-5 left-5">
    <div
      class="pointer-events-auto flex w-72 flex-col gap-6 rounded-xl border border-neutral-700/50 bg-neutral-900/80 p-6 pt-4.5 font-sans shadow-2xl backdrop-blur-md">
      <h1 class="m-0 text-xl font-bold tracking-widest text-neutral-100 uppercase">Orbit Sim</h1>

      <div class="flex flex-col gap-3">
        <label class="text-[0.7rem] font-bold tracking-tight text-neutral-400 uppercase">
          Simulation
        </label>
        <div class="flex gap-2">
          <button
            class="flex-1 cursor-pointer rounded-md border border-neutral-700/50 bg-neutral-800/50 px-3 py-2 font-semibold text-neutral-100 transition-all hover:bg-neutral-800 active:scale-95"
            @click="$emit('update:isPaused', !isPaused)">
            {{ isPaused ? 'Resume' : 'Pause' }}
          </button>
          <button
            class="flex-1 cursor-pointer rounded-md border border-neutral-700/50 bg-neutral-800/50 px-3 py-2 font-semibold text-neutral-100 transition-all hover:bg-neutral-800 active:scale-95"
            @click="$emit('clear')">
            Clear
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-[0.7rem] font-bold tracking-tight text-neutral-400 uppercase">
          Spawn Mode
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            class="cursor-pointer rounded-md border px-3 py-2 font-bold transition-all"
            :class="
              spawnMode === BodyType.PLANET
                ? 'border-neutral-200 bg-neutral-200 text-neutral-900'
                : 'border-neutral-700/50 bg-neutral-800/50 text-neutral-100 hover:bg-neutral-800'
            "
            @click="$emit('update:spawnMode', BodyType.PLANET)">
            Planet
          </button>
          <button
            class="cursor-pointer rounded-md border px-3 py-2 font-bold transition-all"
            :class="
              spawnMode === BodyType.BLACK_HOLE
                ? 'border-neutral-200 bg-neutral-200 text-neutral-900'
                : 'border-neutral-700/50 bg-neutral-800/50 text-neutral-100 hover:bg-neutral-800'
            "
            @click="$emit('update:spawnMode', BodyType.BLACK_HOLE)">
            Black Hole
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[0.7rem] font-bold tracking-tight text-neutral-400 uppercase">
            Gravity Constant
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ gravitationalConstant }}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          class="w-full cursor-pointer accent-neutral-400"
          :value="gravitationalConstant"
          @input="
            $emit('update:gravitationalConstant', Number(($event.target as HTMLInputElement).value))
          " />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[0.7rem] font-bold tracking-tight text-neutral-400 uppercase">
            Time Scale
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ timeScale.toFixed(1) }}×</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          class="w-full cursor-pointer accent-neutral-400"
          :value="timeScale"
          @input="$emit('update:timeScale', Number(($event.target as HTMLInputElement).value))" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[0.7rem] font-bold tracking-tight text-neutral-400 uppercase">
            New Object Mass
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ objMass }}</span>
        </div>
        <input
          type="range"
          min="10"
          max="5000"
          step="10"
          class="w-full cursor-pointer accent-neutral-400"
          :value="objMass"
          @input="$emit('update:objMass', Number(($event.target as HTMLInputElement).value))" />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-[0.7rem] font-bold tracking-tight text-neutral-400 uppercase">
            New Object Radius
          </label>
          <span class="font-mono text-xs text-neutral-200">{{ objRadius }}</span>
        </div>
        <input
          type="range"
          min="2"
          max="50"
          step="1"
          class="w-full cursor-pointer accent-neutral-400"
          :value="objRadius"
          @input="$emit('update:objRadius', Number(($event.target as HTMLInputElement).value))" />
      </div>

      <div class="mt-2 flex flex-row justify-between text-[0.7rem] text-neutral-500">
        <p>Shift + Drag to Pan</p>
        <p>Wheel to Zoom</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BodyType } from '@/physics/body';

defineProps<{
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
      | 'update:timeScale'
      | 'update:objMass'
      | 'update:objRadius',
    value: number
  ): void;
  (event: 'update:isPaused', value: boolean): void;
  (event: 'update:spawnMode', value: BodyType): void;
}>();
</script>
