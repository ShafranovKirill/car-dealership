<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModelStore } from '@/stores/model.store'
import type { CarModelResponse } from '@car/types'
import { PHOTO_KEYS } from '@car/common'
import { ImageHelper } from '@/utils/image.utils'

const router = useRouter()
const store = useModelStore()
const page = ref(1)
const perPage = 8
const error = ref('')
const noMore = ref(false)

async function loadModels() {
  store.isLoading = true
  error.value = ''
  try {
    const data = await store.fetchAll(page.value, perPage)
    noMore.value = data.length < perPage
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    error.value = 'Не удалось загрузить модели. Попробуйте позже.'
    noMore.value = true
  } finally {
    store.isLoading = false
  }
}

function openModel(modelId: string) {
  router.push({ name: 'model-detail', params: { modelId } })
}

function prevPage() {
  if (page.value <= 1) return
  page.value -= 1
}

function nextPage() {
  if (noMore.value) return
  page.value += 1
}

watch(page, async () => {
  await loadModels()
})

onMounted(loadModels)

function getImageUrl(model: CarModelResponse) {
  return ImageHelper.getPhotoUrl(model.images, PHOTO_KEYS.PHOTO_MD) || ''
}

function formatPrice(value: number) {
  return value.toLocaleString('ru-RU') + ' ₽'
}
</script>

<template>
  <section class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Каталог</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Модели автомобилей</h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Выберите модель и посмотрите её характеристики, силовую установку и доступные комплектации.
          </p>
        </div>
        <div class="rounded-3xl bg-white px-5 py-4 shadow-sm border border-slate-200">
          <p class="text-sm text-slate-500">Страница</p>
          <p class="mt-1 text-xl font-semibold text-slate-900">{{ page }}</p>
        </div>
      </header>

      <div v-if="store.isLoading" class="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600 shadow-sm">
        Загружаем модели...
      </div>

      <div v-else>
        <div v-if="error" class="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-6 text-rose-700 shadow-sm">
          {{ error }}
        </div>

        <div v-if="!store.models.length && !error" class="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
          Модели не найдены.
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="model in store.models"
            :key="model.id"
            class="group overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <button @click="openModel(model.id)" class="flex h-full flex-col text-left">
              <div class="relative h-72 sm:h-80 overflow-hidden bg-slate-100">
                <img
                  v-if="getImageUrl(model)"
                  :src="getImageUrl(model)"
                  alt="Фото модели"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div v-else class="flex h-full items-center justify-center text-slate-400">
                  Нет фото
                </div>
              </div>
              <div class="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{{ model.bodyType || 'Модель' }}</p>
                  <h2 class="mt-2 text-xl font-semibold text-slate-900">{{ model.name }}</h2>
                </div>
                <div class="grid gap-2 text-sm text-slate-600">
                  <div>Цена от <span class="font-semibold text-slate-900">{{ formatPrice(model.minPrice) }}</span></div>
                  <div>Годы: {{ model.yearFrom }}{{ model.yearTo ? ' — ' + model.yearTo : '+' }}</div>
                  <div>Класс: {{ model.carClass }}</div>
                </div>
                <div class="mt-4 flex items-center justify-between gap-3">
                  <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Подробнее
                  </span>
                  <span class="text-xs text-slate-400">{{ model.enginePower }} л.с.</span>
                </div>
              </div>
            </button>
          </article>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap gap-3">
          <button
            @click="prevPage"
            :disabled="page <= 1"
            class="inline-flex items-center justify-center rounded-3xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            Назад
          </button>
          <button
            @click="nextPage"
            :disabled="noMore || !store.models.length"
            class="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Далее
          </button>
        </div>
        <p class="text-sm text-slate-500">
          Показано {{ store.models.length }} моделей на странице.
        </p>
      </div>
    </div>
  </section>
</template>
