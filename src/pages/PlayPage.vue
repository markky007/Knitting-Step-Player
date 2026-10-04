<template>
  <div class="play-page-root" @keydown="onKeyDown" tabindex="0">
    <!-- Slim Play Top Bar -->
    <header class="play-top-bar row items-center justify-between q-px-md">
      <!-- Left: Exit to Library -->
      <router-link to="/" class="row items-center text-decoration-none text-ink">
        <q-btn icon="close" flat round dense class="q-mr-xs" />
        <span class="kp-title-sm text-ink ellipsis title-max-w">
          {{ playerStore.pattern?.title }}
        </span>
      </router-link>

      <!-- Center: Part & Global Progress -->
      <div class="row items-center q-gutter-sm gt-xs">
        <span class="kp-chip">
          {{ playerStore.currentPart?.name }}
        </span>
        <span class="kp-caption text-grey-8">
          {{ playerStore.globalProgress.percentage }}%
        </span>
      </div>

      <!-- Right: Drawer Toggle & Settings -->
      <div class="row items-center q-gutter-xs">
        <q-btn
          icon="format_list_bulleted"
          flat
          round
          dense
          @click="stepDrawerOpen = !stepDrawerOpen"
        />
      </div>
    </header>

    <!-- Main Content Area: Responsive Layout (Side panel on md+, stacked on xs/sm) -->
    <div class="play-body-container" :class="{ 'landscape-layout': $q.screen.gt.sm }">
      <!-- 3D Center Viewport -->
      <main class="viewport-area">
        <PlayerViewport
          :pattern="playerStore.pattern"
          :analysis="playerStore.analysis"
          :part-index="playerStore.partIndex"
          :step-index="playerStore.stepIndex"
          :iteration="playerStore.iteration"
          :view-mode="playerStore.view"
          :enable-animation="settingsStore.enableAnimation"
          :enable-auto-focus="settingsStore.enableAutoFocus"
          :active-step-label="playerStore.currentStep?.label || ''"
          :active-step-count="playerStore.currentStepAnalysis?.stitchesAfter || 0"
          @next="playerStore.next"
          @prev="playerStore.prev"
          @toggle-autofocus="settingsStore.enableAutoFocus = !settingsStore.enableAutoFocus"
        />
      </main>

      <!-- Step Card & Controls Panel -->
      <aside class="step-card-panel column justify-between">
        <!-- Step View Mode -->
        <div v-if="playerStore.view === 'steps' && playerStore.currentStep" class="q-pa-md step-card-scroll">
          <StepCard
            :step="playerStore.currentStep"
            :stitches-after="playerStore.currentStepAnalysis?.stitchesAfter || 0"
            :part-name="playerStore.currentPart?.name || ''"
            :is-first-step-of-part="playerStore.stepIndex === 0"
            :yarn-change="activeYarnChange"
            :iteration="playerStore.iteration"
            :repeat-total="playerStore.activeRepeatGroup?.repeat"
          />
        </div>

        <!-- Assembly View Mode (F-3D-4) -->
        <div v-else-if="playerStore.view === 'assembly'" class="q-pa-lg text-center column items-center justify-center col">
          <q-icon name="view_in_ar" size="48px" class="text-primary q-mb-md" />
          <h2 class="kp-title-md q-my-none q-mb-xs">{{ $t('player.assemblyTitle') }}</h2>
          <p class="kp-body text-grey-8 q-mb-none">{{ $t('player.assemblySubtitle') }}</p>
        </div>

        <!-- Completion View Mode -->
        <div v-else-if="playerStore.view === 'complete'" class="q-pa-lg text-center column items-center justify-center col">
          <q-icon name="celebration" size="56px" class="text-accent q-mb-md" />
          <h2 class="kp-display-serif q-my-none q-mb-xs text-ink">
            {{ $t('player.completeTitle') }}
          </h2>
          <p class="kp-body text-grey-8 q-mb-lg">
            {{ $t('player.completeSubtitle') }}
          </p>

          <div class="row q-gutter-md justify-center">
            <q-btn
              class="kp-btn-secondary"
              no-caps
              @click="playerStore.resetProgress"
            >
              {{ $t('common.startOver') }}
            </q-btn>
            <router-link to="/" style="text-decoration: none">
              <q-btn class="kp-btn-primary" no-caps>
                {{ $t('library.title') }}
              </q-btn>
            </router-link>
          </div>
        </div>

        <!-- Large Target Navigation Control Bar -->
        <ControlBar
          :is-first-step="playerStore.isFirstStep"
          :is-last-step="playerStore.isLastStep"
          :progress="playerStore.globalProgress"
          @next="playerStore.next"
          @prev="playerStore.prev"
        />
      </aside>
    </div>

    <!-- Step List Drawer (F-PLY-4) -->
    <q-drawer
      v-model="stepDrawerOpen"
      side="right"
      overlay
      bordered
      :width="340"
    >
      <StepList
        v-if="playerStore.pattern"
        :parts="playerStore.pattern.parts"
        :current-part-index="playerStore.partIndex"
        :current-step-index="playerStore.stepIndex"
        @select-step="onSelectStep"
        @close="stepDrawerOpen = false"
      />
    </q-drawer>

    <!-- Continue / Resume Prompt Dialog (F-PLY-5) -->
    <q-dialog v-model="resumeDialogOpen" persistent>
      <q-card class="kp-card" style="max-width: 440px">
        <q-card-section>
          <span class="kp-title-sm block q-mb-sm">
            {{ $t('materials.resumePlaying') }}
          </span>
          <p class="kp-body text-grey-8 q-mb-none">
            {{ $t('player.continuePrompt', { step: savedResumeStepLabel }) }}
          </p>
        </q-card-section>

        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            class="kp-btn-secondary"
            flat
            no-caps
            :label="$t('common.startOver')"
            @click="onStartOver"
          />
          <q-btn
            class="kp-btn-primary"
            no-caps
            :label="$t('common.continue')"
            @click="onResume"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player.store'
import { usePatternStore } from '../stores/pattern.store'
import { useSettingsStore } from '../stores/settings.store'
import { progressRepository } from '../repositories/dexie/DexieProgressRepository'
import type { Progress } from '../repositories/ProgressRepository'
import PlayerViewport from '../components/PlayerViewport.vue'
import StepCard from '../components/StepCard.vue'
import ControlBar from '../components/ControlBar.vue'
import StepList from '../components/StepList.vue'

const route = useRoute()
const playerStore = usePlayerStore()
const patternStore = usePatternStore()
const settingsStore = useSettingsStore()

const stepDrawerOpen = ref(false)
const resumeDialogOpen = ref(false)
const savedResumeProgress = ref<Progress | null>(null)

const savedResumeStepLabel = computed(() => {
  if (!savedResumeProgress.value || !playerStore.pattern) return ''
  const part = playerStore.pattern.parts[savedResumeProgress.value.partIndex]
  const step = part?.steps[savedResumeProgress.value.stepIndex]
  return step ? `${part?.name} - ${step.label}` : 'Previous Step'
})

const activeYarnChange = computed(() => {
  const currentStep = playerStore.currentStep
  if (!currentStep?.yarnId || !playerStore.pattern) return null
  return playerStore.pattern.materials.yarns.find((y) => y.id === currentStep.yarnId) || null
})

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  const id = String(route.params.id)
  const pattern = await patternStore.loadPattern(id)
  const analysis = patternStore.patternAnalysis

  if (pattern && analysis) {
    const saved = await progressRepository.get(id)

    if (saved && (saved.partIndex > 0 || saved.stepIndex > 0 || (saved.iteration !== null && saved.iteration > 0) || saved.view !== 'steps')) {
      savedResumeProgress.value = saved
      resumeDialogOpen.value = true
    } else {
      playerStore.initPlayer(pattern, analysis)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  playerStore.cleanupPlayer()
})

function onResume() {
  if (patternStore.currentPattern && patternStore.patternAnalysis) {
    playerStore.initPlayer(
      patternStore.currentPattern,
      patternStore.patternAnalysis,
      savedResumeProgress.value
    )
  }
  resumeDialogOpen.value = false
}

function onStartOver() {
  if (patternStore.currentPattern && patternStore.patternAnalysis) {
    playerStore.initPlayer(patternStore.currentPattern, patternStore.patternAnalysis)
  }
  resumeDialogOpen.value = false
}

function onSelectStep(partIdx: number, stepIdx: number) {
  playerStore.jumpToStep(partIdx, stepIdx)
  stepDrawerOpen.value = false
}

// Keyboard shortcuts (F-PLY-2)
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    playerStore.next()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    playerStore.prev()
  }
}
</script>

<style scoped lang="scss">
.play-page-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--kp-color-surface);
  outline: none;
}

.play-top-bar {
  height: 56px;
  background-color: var(--kp-color-surface);
  border-bottom: 1px solid var(--kp-color-border-light);
  z-index: 10;
}

.title-max-w {
  max-width: 240px;
}

.play-body-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  // Desktop / Tablet Landscape: Split layout
  &.landscape-layout {
    flex-direction: row;

    .viewport-area {
      flex: 1;
      height: 100%;
    }

    .step-card-panel {
      width: 440px;
      height: 100%;
      border-left: 1px solid var(--kp-color-border-light);
      background-color: var(--kp-color-surface);
    }
  }

  // Mobile Portrait: Stacked layout
  &:not(.landscape-layout) {
    .viewport-area {
      height: 52%;
    }

    .step-card-panel {
      height: 48%;
      border-top: 1px solid var(--kp-color-border-light);
      background-color: var(--kp-color-surface);
    }
  }
}

.viewport-area {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.step-card-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.step-card-scroll {
  flex: 1;
  overflow-y: auto;
}

.text-decoration-none {
  text-decoration: none;
}
</style>
