<template>
  <q-page class="settings-page q-pa-lg">
    <div class="settings-content-container">
      <!-- Header -->
      <div class="q-mb-xl">
        <h1 class="kp-display-serif q-my-none text-ink">{{ $t('settings.title') }}</h1>
      </div>

      <!-- Settings Cards -->
      <div class="column q-gutter-lg">
        <!-- Language Selection -->
        <div class="kp-card-flat">
          <div class="row items-center justify-between">
            <div>
              <span class="kp-body-strong block text-ink">{{ $t('settings.language') }}</span>
              <span class="kp-caption text-grey-7">เลือกระหว่างภาษาไทย หรือภาษาอังกฤษ</span>
            </div>

            <q-btn-toggle
              v-model="currentLocale"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="grey-9"
              :options="[
                { label: 'ภาษาไทย', value: 'th' },
                { label: 'English', value: 'en' }
              ]"
            />
          </div>
        </div>

        <!-- Repeat Counter Toggle -->
        <div class="kp-card-flat">
          <div class="row items-center justify-between">
            <div class="col-8">
              <span class="kp-body-strong block text-ink">{{ $t('settings.countRepeats') }}</span>
              <span class="kp-caption text-grey-7">{{ $t('settings.countRepeatsDesc') }}</span>
            </div>

            <q-toggle
              v-model="settingsStore.countRepeats"
              color="primary"
            />
          </div>
        </div>

        <!-- 3D Animation Toggle -->
        <div class="kp-card-flat">
          <div class="row items-center justify-between">
            <div class="col-8">
              <span class="kp-body-strong block text-ink">{{ $t('settings.animations') }}</span>
              <span class="kp-caption text-grey-7">{{ $t('settings.animationsDesc') }}</span>
            </div>

            <q-toggle
              v-model="settingsStore.enableAnimation"
              color="primary"
            />
          </div>
        </div>

        <!-- Auto Focus Toggle -->
        <div class="kp-card-flat">
          <div class="row items-center justify-between">
            <div class="col-8">
              <span class="kp-body-strong block text-ink">{{ $t('settings.autoFocus') }}</span>
              <span class="kp-caption text-grey-7">{{ $t('settings.autoFocusDesc') }}</span>
            </div>

            <q-toggle
              v-model="settingsStore.enableAutoFocus"
              color="primary"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings.store'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

const currentLocale = computed<'th' | 'en'>({
  get: () => settingsStore.locale,
  set: (val: 'th' | 'en') => {
    settingsStore.locale = val
    locale.value = val
  }
})
</script>

<style scoped lang="scss">
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-content-container {
  width: 100%;
}
</style>
