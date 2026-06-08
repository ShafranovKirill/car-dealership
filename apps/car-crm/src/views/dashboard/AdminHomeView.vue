<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const slogans = [
  t('dashboard_extra.msg1'),
  t('dashboard_extra.msg2'),
  t('dashboard_extra.msg3'),
]
const active = ref(0)

onMounted(() => {
  setInterval(() => {
    active.value = (active.value + 1) % slogans.length
  }, 3500)
})
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <div class="relative overflow-hidden rounded-xl shadow-md">
      <div class="absolute inset-0 bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 animate-gradient-x" />
      <div class="relative p-10 text-white">
        <h1 class="text-3xl sm:text-4xl font-extrabold drop-shadow">{{ t('dashboard_extra.welcome') }}</h1>
        <p class="mt-3 text-lg text-white/90">{{ t('dashboard_extra.subtitle') }}</p>

        <div class="mt-6 flex items-center gap-6">
          <div class="flex-1">
            <div class="text-2xl sm:text-3xl font-semibold tracking-tight">{{ slogans[active] }}</div>
            <div class="mt-4 text-sm text-white/80">{{ t('dashboard_extra.hint') }}</div>
          </div>

          <div class="flex gap-3">
            <router-link to="/brands" class="inline-flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg">
              <span class="text-xl">🏷️</span>
              <span class="font-medium">{{ t('brands.title', 'Марки') }}</span>
            </router-link>
            <router-link to="/models" class="inline-flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg">
              <span class="text-xl">🚗</span>
              <span class="font-medium">{{ t('models.title', 'Модели') }}</span>
            </router-link>
            <router-link to="/appointments" class="inline-flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg">
              <span class="text-xl">📅</span>
              <span class="font-medium">{{ t('appointments.title', 'Заявки') }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>


  </section>
</template>

<style scoped>
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 8s ease infinite;
}
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
