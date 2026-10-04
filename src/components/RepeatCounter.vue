<template>
  <div v-if="repeatTotal && repeatTotal > 1" class="repeat-counter-container">
    <div class="row items-center justify-between q-mb-xs">
      <span class="kp-label text-weight-medium">
        {{ $t('player.repeatCounter') }}
      </span>
      <span class="kp-caption text-grey-7">
        {{ $t('player.repeatProgress', { current: currentIteration + 1, total: repeatTotal }) }}
      </span>
    </div>

    <!-- Visual pill dots for each repeat iteration -->
    <div class="row q-gutter-xs items-center">
      <div
        v-for="idx in repeatTotal"
        :key="idx"
        class="repeat-pill"
        :class="{
          'active': idx - 1 === currentIteration,
          'completed': idx - 1 < currentIteration
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentIteration: number
  repeatTotal: number
}>()
</script>

<style scoped lang="scss">
.repeat-counter-container {
  background-color: var(--kp-color-surface-muted);
  border-radius: var(--kp-radius-lg);
  padding: 8px 12px;
  margin-bottom: 12px;
}

.repeat-pill {
  flex: 1;
  height: 6px;
  border-radius: var(--kp-radius-full);
  background-color: var(--kp-color-border-light);
  transition: all 0.2s ease;

  &.completed {
    background-color: var(--kp-color-ink-soft);
  }

  &.active {
    background-color: var(--kp-color-accent);
    box-shadow: 0 0 0 1px var(--kp-color-primary);
    transform: scaleY(1.3);
  }
}
</style>
