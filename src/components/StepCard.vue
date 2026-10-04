<template>
  <div class="step-card-wrapper">
    <!-- Part Change Notice -->
    <div v-if="isFirstStepOfPart" class="callout-banner part-banner q-mb-sm">
      <q-icon name="layers" size="18px" class="q-mr-xs text-primary" />
      <span class="kp-label">
        {{ $t('player.partChange') }}: <strong>{{ partName }}</strong>
      </span>
    </div>

    <!-- Yarn Change Callout (F-PLY-7) -->
    <div v-if="yarnChange" class="callout-banner yarn-banner q-mb-sm">
      <span
        class="yarn-swatch-dot q-mr-sm"
        :style="{ backgroundColor: yarnChange.colorHex }"
      />
      <span class="kp-label">
        {{ $t('player.yarnChange') }} <strong>{{ yarnChange.name }}</strong>
      </span>
    </div>

    <div class="kp-card-flat step-main-card">
      <!-- Step Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <span class="kp-title-md">{{ step.label }}</span>
          <span class="kp-chip">
            {{ $t('player.stitchesCount', { count: stitchesAfter }) }}
          </span>
        </div>

        <div v-if="warning" class="kp-accent-badge">
          {{ warning }}
        </div>
      </div>

      <!-- Raw Instruction Text -->
      <div class="kp-body-lg text-ink instruction-text q-mb-md">
        {{ step.raw }}
      </div>

      <!-- Repeat Counter Sub-step -->
      <RepeatCounter
        v-if="repeatTotal && repeatTotal > 1 && iteration !== null"
        :current-iteration="iteration"
        :repeat-total="repeatTotal"
      />

      <!-- Optional Pattern Note -->
      <div v-if="step.note" class="step-note q-mt-sm">
        <q-icon name="info" size="16px" class="q-mr-xs text-grey-7" />
        <span class="kp-caption text-grey-8">{{ step.note }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step, Yarn } from '../domain/types'
import RepeatCounter from './RepeatCounter.vue'

defineProps<{
  step: Step
  stitchesAfter: number
  partName: string
  isFirstStepOfPart: boolean
  yarnChange?: Yarn | null | undefined
  iteration: number | null
  repeatTotal?: number | undefined
  warning?: string | null | undefined
}>()
</script>

<style scoped lang="scss">
.step-card-wrapper {
  width: 100%;
}

.callout-banner {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: var(--kp-radius-md);
  border: 1px solid var(--kp-color-border);
}

.part-banner {
  background-color: var(--kp-color-surface-warm);
  color: var(--kp-color-ink);
}

.yarn-banner {
  background-color: var(--kp-color-surface-muted);
  color: var(--kp-color-ink);
}

.yarn-swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid var(--kp-color-border);
}

.step-main-card {
  background-color: var(--kp-color-surface);
  border: 1px solid var(--kp-color-border);
  border-radius: var(--kp-radius-xl);
  padding: var(--kp-space-xl);
}

.instruction-text {
  line-height: 1.4;
  word-break: break-word;
}

.step-note {
  display: flex;
  align-items: flex-start;
  background-color: var(--kp-color-surface-muted);
  padding: 8px 12px;
  border-radius: var(--kp-radius-md);
}
</style>
