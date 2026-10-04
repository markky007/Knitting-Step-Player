<template>
  <div class="step-list-container">
    <div class="q-pa-md border-bottom">
      <div class="row items-center justify-between">
        <span class="kp-title-sm">{{ $t('player.stepListTitle') }}</span>
        <q-btn icon="close" flat round dense @click="$emit('close')" />
      </div>
    </div>

    <q-scroll-area class="step-scroll-area">
      <div v-for="(part, pIdx) in parts" :key="part.id" class="q-mb-md">
        <!-- Part Header -->
        <div class="part-header row items-center q-px-md q-py-sm">
          <q-icon name="layers" size="18px" class="q-mr-xs text-primary" />
          <span class="kp-label text-weight-medium">{{ part.name }}</span>
          <span class="kp-caption text-grey-7 q-ml-auto">
            {{ part.steps.length }} {{ $t('import.totalSteps') }}
          </span>
        </div>

        <!-- Steps in Part -->
        <div class="step-items q-px-sm">
          <div
            v-for="(step, sIdx) in part.steps"
            :key="step.id"
            class="step-item-row"
            :class="getStepClass(pIdx, sIdx)"
            @click="$emit('select-step', pIdx, sIdx)"
          >
            <div class="step-status-icon q-mr-sm">
              <q-icon
                v-if="isCompleted(pIdx, sIdx)"
                name="check_circle"
                size="18px"
                class="text-positive"
              />
              <q-icon
                v-else-if="isActive(pIdx, sIdx)"
                name="radio_button_checked"
                size="18px"
                class="text-primary"
              />
              <q-icon
                v-else
                name="radio_button_unchecked"
                size="18px"
                class="text-grey-4"
              />
            </div>

            <div class="column flex-1">
              <div class="row items-center justify-between">
                <span class="kp-body-strong">{{ step.label }}</span>
                <span v-if="step.expectedCount" class="kp-caption text-grey-7">
                  ({{ step.expectedCount }})
                </span>
              </div>
              <span class="kp-caption text-grey-8 ellipsis">{{ step.raw }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import type { Part } from '../domain/types'

const props = defineProps<{
  parts: Part[]
  currentPartIndex: number
  currentStepIndex: number
}>()

defineEmits<{
  (e: 'select-step', partIndex: number, stepIndex: number): void
  (e: 'close'): void
}>()

function isCompleted(pIdx: number, sIdx: number): boolean {
  if (pIdx < props.currentPartIndex) return true
  if (pIdx === props.currentPartIndex && sIdx < props.currentStepIndex) return true
  return false
}

function isActive(pIdx: number, sIdx: number): boolean {
  return pIdx === props.currentPartIndex && sIdx === props.currentStepIndex
}

function getStepClass(pIdx: number, sIdx: number): string {
  if (isActive(pIdx, sIdx)) return 'step-active'
  if (isCompleted(pIdx, sIdx)) return 'step-completed'
  return 'step-upcoming'
}
</script>

<style scoped lang="scss">
.step-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--kp-color-surface);
}

.border-bottom {
  border-bottom: 1px solid var(--kp-color-border-light);
}

.step-scroll-area {
  flex: 1;
}

.part-header {
  background-color: var(--kp-color-surface-muted);
}

.step-item-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--kp-radius-md);
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--kp-color-surface-muted);
  }

  &.step-active {
    background-color: var(--kp-color-surface-muted);
    border-left: 3px solid var(--kp-color-primary);
  }

  &.step-completed {
    opacity: 0.85;
  }

  &.step-upcoming {
    opacity: 0.6;
  }
}

.flex-1 {
  flex: 1;
}
</style>
