<template>
  <div class="control-bar-container">
    <div class="row items-center justify-between no-wrap q-gutter-md">
      <!-- Back Button -->
      <q-btn
        class="kp-btn-secondary control-btn"
        :disable="isFirstStep"
        flat
        no-caps
        @click="$emit('prev')"
      >
        <q-icon name="arrow_back" size="20px" class="q-mr-xs" />
        <span>{{ $t('common.back') }}</span>
      </q-btn>

      <!-- Center Progress Indicator -->
      <div class="column items-center justify-center text-center progress-indicator">
        <span class="kp-caption text-grey-8">
          {{ progress.current }} / {{ progress.total }}
        </span>
        <div class="progress-bar-track q-mt-xs">
          <div
            class="progress-bar-fill"
            :style="{ width: `${progress.percentage}%` }"
          />
        </div>
      </div>

      <!-- Next Button -->
      <q-btn
        class="kp-btn-primary control-btn"
        no-caps
        @click="$emit('next')"
      >
        <span>{{ isLastStep ? $t('common.confirm') : $t('common.next') }}</span>
        <q-icon name="arrow_forward" size="20px" class="q-ml-xs" />
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isFirstStep: boolean
  isLastStep: boolean
  progress: {
    current: number
    total: number
    percentage: number
  }
}>()

defineEmits<{
  (e: 'next'): void
  (e: 'prev'): void
}>()
</script>

<style scoped lang="scss">
.control-bar-container {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--kp-color-surface);
  border-top: 1px solid var(--kp-color-border-light);
}

.control-btn {
  min-width: 100px;
  min-height: 52px; // Comfortably exceeds 48px touch target
  font-size: 16px;
}

.progress-indicator {
  min-width: 120px;
}

.progress-bar-track {
  width: 100%;
  height: 4px;
  background-color: var(--kp-color-surface-muted);
  border-radius: var(--kp-radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--kp-color-ink);
  transition: width 0.3s ease;
}
</style>
