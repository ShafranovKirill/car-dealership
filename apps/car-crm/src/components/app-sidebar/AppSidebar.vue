<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const visible = defineModel('visible', { type: Boolean, default: false })
const router = useRouter()
const menuItems = ref([
  {
    label: t('dashboard.brands'),
    icon: 'pi pi-list',
    command: () => {
      router.push({ name: 'brands' })
    },
  },
  {
    label: t('dashboard.models'),
    icon: 'pi pi-list',
    command: () => {
      router.push({ name: 'models' })
    },
  },
  {
    label: t('dashboard.appointments'),
    icon: 'pi pi-list',
    command: () => {
      router.push({ name: 'appointments' })
    },
  },
])
</script>
<template>
  <Sidebar v-model:visible="visible">
    <div class="flex flex-col justify-between h-full">
      <div><PanelMenu :model="menuItems"></PanelMenu></div>
      <div>
        <SidebarSettings v-model:isMenuOpen="visible" />
      </div>
    </div>
  </Sidebar>
</template>
