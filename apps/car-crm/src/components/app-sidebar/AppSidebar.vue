<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const visible = defineModel('visible', { type: Boolean, default: false })
const router = useRouter()
const menuItems = ref([
  {
    label: 'Производители',
    icon: 'pi pi-list',
    command: () => {
      router.push({ name: 'brands' })
    },
  },
    {
    label: 'Модели',
    icon: 'pi pi-list',
    command: () => {
      router.push({ name: 'models' })
    },
  },
    {
    label: 'Записи и заявки',
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
