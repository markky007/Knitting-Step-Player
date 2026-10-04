<template>
  <div
    class="viewport-wrapper"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- 3D Canvas Mount Point -->
    <div
      v-show="sceneState.isSupported && !sceneState.errorMessage"
      ref="canvasContainer"
      class="canvas-container"
    />

    <!-- WebGL Unsupported / Error Fallback (Section 11) -->
    <div
      v-if="!sceneState.isSupported || sceneState.errorMessage"
      class="webgl-fallback-container column items-center justify-center text-center q-pa-lg"
    >
      <q-icon name="view_in_ar" size="48px" class="text-grey-6 q-mb-md" />
      <span class="kp-title-sm q-mb-xs">
        {{ sceneState.errorMessage || $t('player.webglUnavailable') }}
      </span>
      <span class="kp-caption text-grey-7">
        {{ $t('player.webglUnavailable') }}
      </span>
    </div>

    <!-- Non-blocking 20k stitch safeguard warning (Section 8) -->
    <div v-if="sceneState.isExceedingLimit" class="stitch-warning-banner">
      <q-icon name="warning" size="16px" class="q-mr-xs" />
      <span>Rendering active part only (>20,000 stitches)</span>
    </div>

    <!-- On-Screen 3D Action Overlay -->
    <div class="viewport-overlay-controls row items-center q-gutter-xs">
      <q-btn
        round
        flat
        dense
        size="sm"
        icon="center_focus_strong"
        class="overlay-btn"
        :title="$t('player.resetCamera')"
        @click="resetCamera"
      />
      <q-btn
        round
        flat
        dense
        size="sm"
        :icon="autoFocusActive ? 'videocam' : 'videocam_off'"
        class="overlay-btn"
        :class="{ 'btn-active': autoFocusActive }"
        :title="$t('player.toggleAutoFocus')"
        @click="$emit('toggle-autofocus')"
      />
    </div>

    <!-- Screen Reader Live Region (WCAG 2.2 AA) -->
    <div
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ activeStepLabel }}: {{ activeStepCount }} stitches
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import type { Pattern, PatternAnalysis } from '../domain/types'
import { useStitchScene } from '../scene/useStitchScene'

const props = defineProps<{
  pattern: Pattern | null
  analysis: PatternAnalysis | null
  partIndex: number
  stepIndex: number
  iteration: number | null
  viewMode: 'steps' | 'assembly' | 'complete'
  enableAnimation: boolean
  enableAutoFocus: boolean
  activeStepLabel: string
  activeStepCount: number
}>()

const emit = defineEmits<{
  (e: 'next'): void
  (e: 'prev'): void
  (e: 'toggle-autofocus'): void
}>()

const canvasContainer = ref<HTMLElement | null>(null)
const autoFocusActive = toRef(props, 'enableAutoFocus')

const {
  sceneState,
  rebuildScene,
  updateVisibilityAndFocus,
  resetCamera
} = useStitchScene(
  canvasContainer,
  toRef(props, 'pattern'),
  toRef(props, 'analysis'),
  toRef(props, 'partIndex'),
  toRef(props, 'stepIndex'),
  toRef(props, 'iteration'),
  toRef(props, 'viewMode'),
  toRef(props, 'enableAnimation'),
  toRef(props, 'enableAutoFocus')
)

// Watch for pattern changes to rebuild meshes
watch(
  () => props.pattern,
  () => {
    rebuildScene()
  }
)

// Watch for step or iteration changes
watch(
  [() => props.partIndex, () => props.stepIndex, () => props.iteration, () => props.viewMode],
  ([newPart], [oldPart]) => {
    updateVisibilityAndFocus(newPart !== oldPart)
  }
)

// Touch Swipe Detection for Hands-Free Crafting (F-PLY-2)
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  if (e.touches[0]) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
}

function onTouchEnd(e: TouchEvent) {
  if (!e.changedTouches[0]) return
  const deltaX = e.changedTouches[0].clientX - touchStartX
  const deltaY = e.changedTouches[0].clientY - touchStartY

  // Ensure horizontal swipe
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
    if (deltaX < 0) {
      // Swipe left -> Next
      emit('next')
    } else {
      // Swipe right -> Prev
      emit('prev')
    }
  }
}
</script>

<style scoped lang="scss">
.viewport-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--kp-color-surface);
  user-select: none;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.webgl-fallback-container {
  width: 100%;
  height: 100%;
  background-color: var(--kp-color-surface-muted);
}

.stitch-warning-banner {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--kp-color-accent);
  color: var(--kp-color-ink);
  padding: 4px 12px;
  border-radius: var(--kp-radius-md);
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  z-index: 10;
}

.viewport-overlay-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
}

.overlay-btn {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  color: var(--kp-color-ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

  &.btn-active {
    background-color: var(--kp-color-ink);
    color: var(--kp-color-on-dark);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
