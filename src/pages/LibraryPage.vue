<template>
  <q-page class="library-page q-pa-lg">
    <div class="library-content-container">
      <!-- Title & Search Hero -->
      <div class="row items-center justify-between q-mb-xl">
        <div>
          <h1 class="kp-display-serif q-my-none text-ink">{{ $t('library.title') }}</h1>
          <p class="kp-body text-grey-8 q-mt-xs q-mb-none">{{ $t('library.subtitle') }}</p>
        </div>

        <router-link to="/import" style="text-decoration: none">
          <q-btn class="kp-btn-primary" no-caps>
            <q-icon name="add" size="20px" class="q-mr-xs" />
            <span>{{ $t('common.import') }}</span>
          </q-btn>
        </router-link>
      </div>

      <!-- Search Input -->
      <div class="search-bar-wrapper q-mb-lg">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          :placeholder="$t('library.searchPlaceholder')"
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" size="20px" class="text-grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredPatterns.length === 0"
        class="empty-state-card kp-card column items-center justify-center text-center q-pa-xl"
      >
        <q-icon name="menu_book" size="48px" class="text-grey-5 q-mb-md" />
        <span class="kp-title-sm q-mb-xs">{{ $t('library.emptyTitle') }}</span>
        <span class="kp-body text-grey-7 q-mb-lg">{{ $t('library.emptySubtitle') }}</span>

        <q-btn
          class="kp-btn-secondary"
          no-caps
          @click="loadSample"
        >
          <q-icon name="download" size="18px" class="q-mr-xs" />
          <span>{{ $t('library.loadSample') }}</span>
        </q-btn>
      </div>

      <!-- Pattern Grid -->
      <div v-else class="row q-col-gutter-lg">
        <div
          v-for="item in filteredPatterns"
          :key="item.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <div class="kp-card pattern-grid-card column justify-between">
            <div>
              <!-- Card Header with Craft & Status -->
              <div class="row items-center justify-between q-mb-md">
                <span class="kp-chip text-capitalize">{{ item.craft }}</span>
                <span
                  class="status-chip"
                  :class="`status-${item.status}`"
                >
                  {{ getStatusText(item.status) }}
                </span>
              </div>

              <!-- Pattern Title -->
              <h2 class="kp-title-md q-my-none text-ink ellipsis-2-lines">
                {{ item.title }}
              </h2>

              <!-- Details Summary -->
              <div class="row items-center q-gutter-md q-mt-md text-grey-8">
                <div class="row items-center">
                  <q-icon name="layers" size="16px" class="q-mr-xs text-grey-6" />
                  <span class="kp-caption">{{ item.partCount }} {{ $t('import.partsCount') }}</span>
                </div>
                <div class="row items-center">
                  <q-icon name="format_list_numbered" size="16px" class="q-mr-xs text-grey-6" />
                  <span class="kp-caption">{{ item.totalSteps }} {{ $t('import.totalSteps') }}</span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="row items-center justify-between q-mt-xl pt-border">
              <q-btn
                icon="delete_outline"
                flat
                round
                dense
                color="grey-7"
                :title="$t('common.delete')"
                @click="promptDelete(item)"
              />

              <router-link
                :to="`/pattern/${item.id}`"
                style="text-decoration: none"
              >
                <q-btn class="kp-btn-primary" no-caps>
                  <span>{{ item.status === 'in_progress' ? $t('common.continue') : $t('common.start') }}</span>
                  <q-icon name="arrow_forward" size="18px" class="q-ml-xs" />
                </q-btn>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card class="kp-card" style="max-width: 440px">
        <q-card-section>
          <span class="kp-title-sm block q-mb-sm">
            {{ $t('library.deleteConfirmTitle') }}
          </span>
          <p class="kp-body text-grey-8 q-mb-none">
            {{ $t('library.deleteConfirmMessage', { title: patternToDelete?.title }) }}
          </p>
        </q-card-section>

        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            class="kp-btn-secondary"
            flat
            no-caps
            :label="$t('common.cancel')"
            @click="deleteDialogOpen = false"
          />
          <q-btn
            class="kp-btn-primary bg-negative"
            no-caps
            :label="$t('common.delete')"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePatternStore } from '../stores/pattern.store'
import type { PatternSummary } from '../repositories/PatternRepository'
import type { Pattern } from '../domain/types'
import sampleBallFixture from '../../tests/fixtures/sample-ball.json'

const { t } = useI18n()
const patternStore = usePatternStore()

const searchQuery = ref('')
const deleteDialogOpen = ref(false)
const patternToDelete = ref<PatternSummary | null>(null)

onMounted(async () => {
  await patternStore.fetchPatterns()
})

const filteredPatterns = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return patternStore.patternsList
  return patternStore.patternsList.filter((p) =>
    p.title.toLowerCase().includes(query)
  )
})

function getStatusText(status: 'not_started' | 'in_progress' | 'completed'): string {
  switch (status) {
    case 'not_started':
      return t('library.status.notStarted')
    case 'in_progress':
      return t('library.status.inProgress')
    case 'completed':
      return t('library.status.completed')
  }
}

async function loadSample() {
  await patternStore.saveImportedPattern(sampleBallFixture as unknown as Pattern)
}

function promptDelete(pattern: PatternSummary) {
  patternToDelete.value = pattern
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  if (patternToDelete.value) {
    await patternStore.deletePattern(patternToDelete.value.id)
    deleteDialogOpen.value = false
    patternToDelete.value = null
  }
}
</script>

<style scoped lang="scss">
.library-page {
  max-width: 1200px;
  margin: 0 auto;
}

.library-content-container {
  width: 100%;
}

.search-input {
  max-width: 480px;
}

.empty-state-card {
  min-height: 280px;
}

.pattern-grid-card {
  height: 100%;
  min-height: 220px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.status-chip {
  font-family: var(--kp-font-sans);
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: var(--kp-radius-full);

  &.status-not_started {
    background-color: var(--kp-color-surface-muted);
    color: var(--kp-color-muted);
  }

  &.status-in_progress {
    background-color: var(--kp-color-accent);
    color: var(--kp-color-ink);
  }

  &.status-completed {
    background-color: var(--kp-color-primary);
    color: var(--kp-color-on-dark);
  }
}

.pt-border {
  border-top: 1px solid var(--kp-color-border-light);
  padding-top: 16px;
}
</style>
