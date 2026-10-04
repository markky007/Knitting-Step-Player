<template>
  <div class="fullscreen bg-surface text-ink text-center q-pa-md column flex-center">
    <div>
      <div class="kp-hero-display q-mb-md">
        404
      </div>

      <div class="kp-title-md text-grey-7 q-mb-xl">
        Page not found
      </div>

      <router-link to="/" style="text-decoration: none">
        <q-btn
          class="kp-btn-primary"
          no-caps
          label="Return to Library"
        />
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bg-surface {
  background-color: var(--kp-color-surface);
}
</style>
