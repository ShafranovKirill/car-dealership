<script setup lang="ts">

import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/state/theme.store'
import { useLangStore } from '@/stores/state/lang.store'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
const themeStore = useThemeStore()
const langStore = useLangStore()
const authStore = useAuthStore()


const isMenuOpen = defineModel('isMenuOpen', { type: Boolean })
</script>

<template>
  <div class="mt-auto border-t border-surface-200 dark:border-surface-700 pt-4 flex flex-col gap-2">
    <Button
      :label="t('dashboard.collapseMenu')"
      :icon="'pi pi-chevron-left'"
      severity="secondary"
      text
      class="w-full justify-start py-2!"
      @click="isMenuOpen = false"
    />

    <Button
      :label="langStore.currentLocale === 'ru' ? t('dashboard.english') : t('dashboard.russian')"
      icon="pi pi-language"
      severity="secondary"
      text
      class="w-full justify-start py-2!"
      @click="langStore.toggleLocale"
    />

    <Button
      :label="themeStore.isDark ? t('dashboard.lightTheme') : t('dashboard.darkTheme')"
      :icon="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'"
      severity="secondary"
      text
      class="w-full justify-start py-2!"
      @click="themeStore.toggleTheme"
    />

    <Button
      :label="t('dashboard.logout')"
      icon="pi pi-sign-out"
      severity="danger"
      text
      class="w-full justify-start py-2!"
      @click="authStore.logout()"
    />
  </div>
</template>
