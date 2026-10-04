<template>
  <q-page class="import-page q-pa-lg">
    <div class="import-content-container">
      <!-- Header -->
      <div class="q-mb-xl">
        <h1 class="kp-display-serif q-my-none text-ink">{{ $t('import.title') }}</h1>
        <p class="kp-body text-grey-8 q-mt-xs q-mb-none">{{ $t('import.subtitle') }}</p>
      </div>

      <!-- Drag & Drop Zone -->
      <div
        class="dropzone-box column items-center justify-center text-center q-pa-xl"
        :class="{ 'dropzone-active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDropFile"
        @click="fileInput?.click()"
      >
        <q-icon name="upload_file" size="56px" class="text-grey-6 q-mb-md" />
        <span class="kp-title-sm q-mb-xs">{{ $t('import.dropzoneText') }}</span>
        <span class="kp-caption text-grey-7 q-mb-md">Only valid schema version 1 .json files</span>

        <q-btn class="kp-btn-secondary" no-caps @click.stop="fileInput?.click()">
          <q-icon name="folder_open" size="18px" class="q-mr-xs" />
          <span>{{ $t('import.browseFiles') }}</span>
        </q-btn>

        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="hidden-file-input"
          @change="onFileSelected"
        />
      </div>

      <!-- Validation Errors Display -->
      <div v-if="validationErrors.length > 0" class="error-box kp-card-flat q-mt-lg">
        <div class="row items-center q-mb-sm text-negative">
          <q-icon name="error_outline" size="20px" class="q-mr-xs" />
          <span class="kp-body-strong">{{ $t('import.invalidJsonFormat') }}</span>
        </div>
        <ul class="q-pl-md q-my-none">
          <li
            v-for="(err, idx) in validationErrors"
            :key="idx"
            class="kp-caption text-negative q-my-xs"
          >
            <strong>{{ err.path }}:</strong> {{ err.message }}
          </li>
        </ul>
      </div>

      <!-- Review Dialog (F-IMP-2) -->
      <ImportReviewDialog
        v-model="reviewDialogOpen"
        :pattern="importedPattern"
        :analysis="importedAnalysis"
        @confirm="confirmImport"
        @cancel="reviewDialogOpen = false"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePatternStore } from '../stores/pattern.store'
import type { Pattern, PatternAnalysis } from '../domain/types'
import ImportReviewDialog from '../components/ImportReviewDialog.vue'

const router = useRouter()
const patternStore = usePatternStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const validationErrors = ref<{ path: string; message: string }[]>([])

const reviewDialogOpen = ref(false)
const importedPattern = ref<Pattern | null>(null)
const importedAnalysis = ref<PatternAnalysis | null>(null)

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    readFile(file)
  }
}

function onDropFile(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    readFile(file)
  }
}

function readFile(file: File) {
  validationErrors.value = []
  const reader = new FileReader()
  reader.onload = (ev) => {
    const content = ev.target?.result as string
    validateAndOpenReview(content)
  }
  reader.readAsText(file)
}

function validateAndOpenReview(jsonString: string) {
  const result = patternStore.validateRawJson(jsonString)

  if (!result.isValid || !result.pattern || !result.analysis) {
    if (result.schemaErrors) {
      validationErrors.value = result.schemaErrors
    } else if (result.analysis?.issues) {
      validationErrors.value = result.analysis.issues
        .filter((i) => i.severity === 'error')
        .map((i) => ({
          path: i.path.join('.'),
          message: i.message
        }))
    }
    return
  }

  importedPattern.value = result.pattern
  importedAnalysis.value = result.analysis
  reviewDialogOpen.value = true
}

async function confirmImport() {
  if (importedPattern.value) {
    await patternStore.saveImportedPattern(importedPattern.value)
    reviewDialogOpen.value = false
    router.push(`/pattern/${importedPattern.value.id}`)
  }
}
</script>

<style scoped lang="scss">
.import-page {
  max-width: 900px;
  margin: 0 auto;
}

.import-content-container {
  width: 100%;
}

.dropzone-box {
  background-color: var(--kp-color-surface);
  border: 2px dashed var(--kp-color-border);
  border-radius: var(--kp-radius-xl);
  min-height: 280px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &.dropzone-active {
    border-color: var(--kp-color-primary);
    background-color: var(--kp-color-surface-muted);
  }
}

.hidden-file-input {
  display: none;
}

.error-box {
  background-color: #fff8f8;
  border: 1px solid #fecaca;
  border-radius: var(--kp-radius-md);
  padding: 16px;
}
</style>
