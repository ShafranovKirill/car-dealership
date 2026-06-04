<script setup lang="ts">
import { ref } from 'vue'
import TestDriveModal from '@/components/test-drive/TestDriveModal.vue'

const showModal = ref(true)
</script>

<template>
  <section class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-900">Тест-драйв</h1>
      <p class="mt-4 text-slate-600">Заполните форму, и мы поможем выбрать удобное время для тест-драйва.</p>
    </div>
  </section>

  <TestDriveModal v-model:show="showModal" />
</template>
