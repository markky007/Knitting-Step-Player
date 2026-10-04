<template>
  <q-layout view="hHh lpR fFf" class="main-layout-root">
    <!-- Editorial Navigation Bar (Harvey System) -->
    <q-header v-if="!isPlayPage" class="editorial-header">
      <div class="header-inner row items-center justify-between q-px-lg">
        <!-- Logo / Title with Serif Display -->
        <router-link to="/" class="row items-center logo-link">
          <q-icon name="gesture" size="24px" class="q-mr-sm text-ink" />
          <span class="kp-title-serif text-ink">{{ $t('common.appTitle') }}</span>
        </router-link>

        <!-- Navigation Links -->
        <div class="row items-center q-gutter-md">
          <router-link to="/" class="nav-item-link" active-class="active">
            {{ $t('library.title') }}
          </router-link>
          <router-link to="/import" class="nav-item-link" active-class="active">
            {{ $t('import.title') }}
          </router-link>
          <router-link to="/settings" class="nav-item-link" active-class="active">
            {{ $t('settings.title') }}
          </router-link>
        </div>
      </div>
    </q-header>

    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isPlayPage = computed(() => route.name === 'play')
</script>

<style scoped lang="scss">
.main-layout-root {
  background-color: var(--kp-color-surface);
  color: var(--kp-color-ink);
  min-height: 100vh;
}

.editorial-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--kp-color-border-light);
  height: 72px;
  display: flex;
  align-items: center;
  z-index: 100;
}

.header-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-link {
  text-decoration: none;
  color: var(--kp-color-ink);
}

.nav-item-link {
  font-family: var(--kp-font-sans);
  font-size: 15px;
  font-weight: 500;
  color: var(--kp-color-muted);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: var(--kp-radius-md);
  transition: all 0.15s ease;

  &:hover {
    color: var(--kp-color-ink);
    background-color: var(--kp-color-surface-muted);
  }

  &.active {
    color: var(--kp-color-ink);
    font-weight: 500;
  }
}

.page-container {
  min-height: calc(100vh - 72px);
}
</style>
