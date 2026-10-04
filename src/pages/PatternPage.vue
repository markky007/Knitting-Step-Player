<template>
  <q-page class="pattern-page q-pa-lg">
    <div v-if="pattern" class="pattern-content-container">
      <!-- Back to library -->
      <router-link to="/" class="row items-center text-grey-8 q-mb-lg text-decoration-none">
        <q-icon name="arrow_back" size="18px" class="q-mr-xs" />
        <span class="kp-caption">{{ $t('common.back') }}</span>
      </router-link>

      <!-- Pattern Hero Header -->
      <div class="row items-start justify-between q-mb-xl">
        <div class="column">
          <span class="kp-chip text-capitalize self-start q-mb-sm">{{ pattern.craft }}</span>
          <h1 class="kp-hero-display q-my-none text-ink">{{ pattern.title }}</h1>
        </div>

        <router-link :to="`/play/${pattern.id}`" style="text-decoration: none">
          <q-btn class="kp-btn-primary play-cta-btn" no-caps>
            <q-icon name="play_arrow" size="22px" class="q-mr-xs" />
            <span>{{ $t('materials.startPlaying') }}</span>
          </q-btn>
        </router-link>
      </div>

      <!-- Materials & Tools Sections (Harvey Tiers) -->
      <div class="row q-col-gutter-xl">
        <!-- Left Column: Yarns & Tools -->
        <div class="col-12 col-md-7">
          <!-- Yarns Section -->
          <div class="kp-card-flat q-mb-lg">
            <h2 class="kp-title-serif q-my-none q-mb-md text-ink">
              {{ $t('materials.yarns') }}
            </h2>

            <div class="column q-gutter-sm">
              <div
                v-for="yarn in pattern.materials.yarns"
                :key="yarn.id"
                class="row items-center q-pa-sm bg-grey-1 rounded-borders"
              >
                <span
                  class="yarn-swatch-circle q-mr-md"
                  :style="{ backgroundColor: yarn.colorHex }"
                />
                <div class="column">
                  <span class="kp-body-strong text-ink">{{ yarn.name }}</span>
                  <span class="kp-caption text-grey-7">
                    {{ yarn.colorHex }} <span v-if="yarn.weight">· {{ yarn.weight }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tools Section -->
          <div class="kp-card-flat q-mb-lg">
            <h2 class="kp-title-serif q-my-none q-mb-md text-ink">
              {{ $t('materials.tools') }}
            </h2>

            <div class="row q-gutter-sm">
              <span
                v-for="(tool, idx) in pattern.materials.tools"
                :key="idx"
                class="kp-chip"
              >
                <q-icon name="handyman" size="14px" class="q-mr-xs text-grey-7" />
                {{ tool }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="pattern.materials.notes" class="kp-card-flat">
            <h2 class="kp-title-serif q-my-none q-mb-md text-ink">
              {{ $t('materials.notes') }}
            </h2>
            <p class="kp-body text-grey-9 q-mb-none">{{ pattern.materials.notes }}</p>
          </div>
        </div>

        <!-- Right Column: Gauge, Parts Summary -->
        <div class="col-12 col-md-5">
          <!-- Gauge Card -->
          <div v-if="pattern.gauge" class="kp-card q-mb-lg">
            <h2 class="kp-title-sm q-my-none q-mb-sm text-ink">
              {{ $t('materials.gauge') }}
            </h2>
            <div class="row items-center justify-between q-py-xs">
              <span class="kp-caption text-grey-7">{{ $t('materials.stitchUnitRatio') }}</span>
              <span class="kp-body-strong">
                {{ pattern.gauge.stitchWidthMm }} mm x {{ pattern.gauge.stitchHeightMm }} mm
              </span>
            </div>
          </div>

          <!-- Parts Overview -->
          <div class="kp-card">
            <h2 class="kp-title-sm q-my-none q-mb-md text-ink">
              {{ $t('import.partsCount') }} ({{ pattern.parts.length }})
            </h2>

            <div class="column q-gutter-sm">
              <div
                v-for="part in pattern.parts"
                :key="part.id"
                class="row items-center justify-between q-py-xs border-bottom-subtle"
              >
                <span class="kp-body-strong">{{ part.name }}</span>
                <span class="kp-chip text-capitalize">{{ part.kind }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="column items-center justify-center q-pa-xl text-center">
      <q-spinner-dots size="48px" color="primary" />
      <span class="kp-body text-grey-7 q-mt-md">{{ $t('common.loading') }}</span>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePatternStore } from '../stores/pattern.store'
import type { Pattern } from '../domain/types'

const route = useRoute()
const patternStore = usePatternStore()
const pattern = ref<Pattern | null>(null)

onMounted(async () => {
  const id = String(route.params.id)
  pattern.value = await patternStore.loadPattern(id)
})
</script>

<style scoped lang="scss">
.pattern-page {
  max-width: 1100px;
  margin: 0 auto;
}

.pattern-content-container {
  width: 100%;
}

.text-decoration-none {
  text-decoration: none;
}

.play-cta-btn {
  padding: 14px 28px;
  font-size: 16px;
}

.yarn-swatch-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--kp-color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.border-bottom-subtle {
  border-bottom: 1px solid var(--kp-color-border-light);
}
</style>
