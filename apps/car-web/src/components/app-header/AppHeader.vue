<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TestDriveModal from '@/components/test-drive/TestDriveModal.vue'
import AutoLoanModal from '@/components/auto-loan/AutoLoanModal.vue'

const navLinks = [
  { name: 'Каталог', to: '/catalog' },
  { name: 'Тест-драйв', to: '/test-drive' },
  { name: 'Сервис', to: '/service' },
  { name: 'Контакты', to: '/contacts' },
]

const isScrolled = ref(false)
const isTestDriveOpen = ref(false)
const isAutoLoanOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const openTestDrive = () => {
  isTestDriveOpen.value = true
}

const openAutoLoan = () => {
  isAutoLoanOpen.value = true
}
</script>

<template>
  <header 
    :class="[
      'fixed top-0 left-0 z-50 w-full transition-all duration-300 border-b',
      isScrolled 
        ? 'h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-slate-200/80' 
        : 'h-16 border-transparent'
    ]"
  >
    <div class="mx-auto flex h-full items-center justify-between px-4 lg:px-8 max-w-7xl">
      
      <div class="flex items-center gap-2.5 group">
        <div class="relative overflow-hidden rounded-lg bg-blue-600 p-1.5 transition-transform group-hover:scale-105">
          <img src="../../assets/logo.png" alt="logo" class="h-5 w-auto hidden sm:block invert brightness-0" />
        </div>
        <router-link 
          to="/" 
          class="text-lg font-black tracking-wider uppercase bg-linear-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-white dark:via-blue-400 dark:to-white bg-size-[200%_auto] bg-clip-text text-transparent animate-gradient-flow"
        >
          Car<span class="text-blue-500">.</span>Dealer
        </router-link>
      </div>

      <nav class="hidden md:flex items-center gap-6">
        <router-link 
          v-for="link in navLinks" 
          :key="link.to"
          :to="link.to" 
          class="relative py-2 text-sm font-medium text-slate-600 dark:text-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-105"
        >
          {{ link.name }}
        </router-link>
      </nav>

      <div class="flex items-center gap-4">
        <a href="tel:+78005553535" class="hidden lg:block text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition">
          8 (800) 555-35-35
        </a>

        <button
          @click="openAutoLoan"
          type="button"
          class="hidden sm:flex relative items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden group"
        >
          <span class="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
          <span class="relative">💳 Кредит</span>
        </button>

        <button
          @click="openTestDrive"
          type="button"
          class="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden group"
        >
          <span class="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
          <span class="relative">Тест‑драйв</span>
        </button>
      </div>
    </div>
  </header>
  
  <BranchSelectionModal />
  <AutoLoanModal v-model:show="isAutoLoanOpen" />
  <TestDriveModal v-model:show="isTestDriveOpen" />
  
  <div class="h-16"></div>
</template>

<style scoped>
@keyframes gradient-flow {
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}

.animate-gradient-flow {
  animation: gradient-flow 6s ease infinite;
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}
</style>