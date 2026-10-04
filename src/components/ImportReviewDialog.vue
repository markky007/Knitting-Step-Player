<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="review-dialog-card column">
      <!-- Header -->
      <div class="review-header row items-center justify-between q-pa-md border-bottom">
        <span class="kp-title-sm">{{ $t('import.reviewTitle') }}</span>
        <q-btn icon="close" flat round dense @click="$emit('cancel')" />
      </div>

      <!-- Content -->
      <q-scroll-area class="col q-pa-md">
        <div v-if="pattern && analysis" class="review-content-container">
          <!-- Summary Header -->
          <div class="kp-card-flat q-mb-md">
            <span class="kp-display-serif block q-mb-xs">{{ pattern.title }}</span>
            <div class="row items-center q-gutter-sm">
              <span class="kp-chip text-capitalize">{{ pattern.craft }}</span>
              <span class="kp-chip">
                {{ pattern.parts.length }} {{ $t('import.partsCount') }}
              </span>
              <span class="kp-chip">
                {{ analysis.totalSteps }} {{ $t('import.totalSteps') }}
              </span>
              <span class="kp-chip">
                {{ analysis.totalStitches }} {{ $t('player.stitchesAfter') }}
              </span>
            </div>
          </div>

          <!-- Issues & Warnings Banner -->
          <div v-if="analysis.issues.length > 0" class="issues-box q-mb-md">
            <div class="row items-center q-mb-xs">
              <q-icon
                :name="hasErrors ? 'error' : 'warning'"
                :class="hasErrors ? 'text-negative' : 'text-warning'"
                size="20px"
                class="q-mr-xs"
              />
              <span class="kp-body-strong">
                {{ $t('import.issuesFound', { count: analysis.issues.length }) }}
              </span>
            </div>
            <ul class="q-pl-md q-my-none">
              <li
                v-for="(issue, idx) in analysis.issues"
                :key="idx"
                class="kp-caption q-my-xs"
                :class="issue.severity === 'error' ? 'text-negative' : 'text-grey-9'"
              >
                <strong>[{{ issue.code }}]</strong>: {{ issue.message }}
              </li>
            </ul>
          </div>

          <!-- Step by Step Counts Table -->
          <span class="kp-title-sm block q-mb-sm">
            {{ $t('import.computedVsExpected') }}
          </span>

          <div
            v-for="(part, pIdx) in pattern.parts"
            :key="part.id"
            class="part-review-section q-mb-md"
          >
            <div class="row items-center q-py-xs q-px-sm bg-grey-2 rounded-borders q-mb-xs">
              <span class="kp-label text-weight-medium">{{ part.name }} ({{ part.kind }})</span>
            </div>

            <div class="q-pl-sm">
              <div
                v-for="(step, sIdx) in part.steps"
                :key="step.id"
                class="row items-center justify-between q-py-xs border-bottom-subtle"
              >
                <div class="column flex-1 q-pr-sm">
                  <span class="kp-body-strong">{{ step.label }}</span>
                  <span class="kp-caption text-grey-7 ellipsis">{{ step.raw }}</span>
                </div>

                <div class="row items-center q-gutter-xs">
                  <span class="kp-caption">
                    Stitches: <strong>{{ analysis.parts[pIdx]?.steps[sIdx]?.stitchesAfter }}</strong>
                  </span>
                  <span
                    v-if="step.expectedCount && step.expectedCount !== analysis.parts[pIdx]?.steps[sIdx]?.stitchesAfter"
                    class="kp-accent-badge text-negative"
                  >
                    exp {{ step.expectedCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-scroll-area>

      <!-- Footer Actions -->
      <div class="review-footer row items-center justify-end q-gutter-md q-pa-md border-top">
        <q-btn
          class="kp-btn-secondary"
          flat
          no-caps
          @click="$emit('cancel')"
        >
          {{ $t('common.cancel') }}
        </q-btn>
        <q-btn
          class="kp-btn-primary"
          no-caps
          :disable="hasErrors"
          @click="$emit('confirm')"
        >
          {{ $t('import.confirmImport') }}
        </q-btn>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pattern, PatternAnalysis } from '../domain/types'

const props = defineProps<{
  modelValue: boolean
  pattern: Pattern | null
  analysis: PatternAnalysis | null
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const hasErrors = computed(() => {
  return props.analysis ? !props.analysis.isValid : false
})
</script>

<style scoped lang="scss">
.review-dialog-card {
  width: 100%;
  height: 100%;
  background-color: var(--kp-color-surface);
}

.review-content-container {
  max-width: 800px;
  margin: 0 auto;
}

.border-bottom {
  border-bottom: 1px solid var(--kp-color-border-light);
}

.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.border-top {
  border-top: 1px solid var(--kp-color-border-light);
}

.issues-box {
  background-color: var(--kp-color-surface-muted);
  border: 1px solid var(--kp-color-border);
  border-radius: var(--kp-radius-md);
  padding: 12px 16px;
}

.flex-1 {
  flex: 1;
}
</style>
