<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PHOTO_KEYS } from '@car/common'
import { useModelStore } from '@/stores/model.store'
import { useConfigurationStore } from '@/stores/configuration.store'
import { ImageHelper } from '@/utils/image.utils'

const route = useRoute()
const router = useRouter()
const modelId = String(route.params.modelId || '')
const modelStore = useModelStore()
const configurationStore = useConfigurationStore()
const model = computed(() => modelStore.selectedModel)
const configurations = computed(() => configurationStore.configurations)
const photos = computed(() => ImageHelper.getPhotoArray(model.value?.images, PHOTO_KEYS.PHOTO_MD))
const activePhotoIndex = ref(0)
const activePhotoUrl = computed(() => ImageHelper.generatePublicUrl(photos.value[activePhotoIndex.value]) || '')
const loading = ref(true)
const error = ref('')

watch(photos, (value) => {
  if (value.length === 0) {
    activePhotoIndex.value = 0
  } else if (activePhotoIndex.value >= value.length) {
    activePhotoIndex.value = value.length - 1
  }
})


function formatPrice(value: number) {
  return value.toLocaleString('ru-RU') + ' ₽'
}

async function loadDetails() {
  loading.value = true
  error.value = ''
  modelStore.clearSelected()

  try {
    await Promise.all([
      modelStore.fetchOne(modelId),
      configurationStore.fetchByModelId(modelId),
    ])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    error.value = 'Не удалось загрузить данные модели. Возможно, модель не найдена.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetails)
</script>

<template>
  <section class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        ← Назад к списку
      </button>

      <div class="mt-6 rounded-4xl bg-white p-6 shadow-sm border border-slate-200">
        <div v-if="loading" class="py-16 text-center text-slate-500">Загрузка модели...</div>
        <div v-else-if="error" class="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-rose-700">
          {{ error }}
        </div>
        <div v-else-if="model">
          <div class="grid gap-8 lg:grid-cols-[minmax(360px,1fr)_minmax(320px,380px)]">
            <div class="space-y-6">
              <div class="overflow-hidden rounded-[28px] bg-slate-100 shadow-sm">
                <div v-if="photos.length" class="relative h-144 sm:h-160 bg-slate-100 overflow-hidden">
                  <img
                    :src="activePhotoUrl"
                    alt="Фото модели"
                    class="h-full w-full object-cover"
                  />
                  <button
                    @click="activePhotoIndex = (activePhotoIndex - 1 + photos.length) % photos.length"
                    class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-sm text-slate-800 hover:bg-white"
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    @click="activePhotoIndex = (activePhotoIndex + 1) % photos.length"
                    class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-sm text-slate-800 hover:bg-white"
                    type="button"
                  >
                    ›
                  </button>
                </div>
                <div v-else class="flex h-144 sm:h-160 items-center justify-center text-slate-400">
                  Изображение отсутствует
                </div>
                <div v-if="photos.length" class="mt-3 flex items-center justify-center gap-2 overflow-x-auto px-1">
                  <button
                    v-for="(photo, index) in photos"
                    :key="photo + index"
                    @click="activePhotoIndex = index"
                    class="h-20 w-28 overflow-hidden rounded-xl border transition duration-150 ease-in-out"
                    :class="index === activePhotoIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'"
                    type="button"
                  >
                    <img :src="ImageHelper.generatePublicUrl(photo) || ''" class="h-full w-full object-cover" />
                  </button>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Срок выпуска</p>
                  <p class="mt-3 text-xl font-semibold text-slate-900">{{ model.yearFrom }}{{ model.yearTo ? ' — ' + model.yearTo : '+' }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Цена от</p>
                  <p class="mt-3 text-xl font-semibold text-slate-900">{{ formatPrice(model.minPrice) }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <p class="text-sm uppercase tracking-[0.24em] text-slate-500">{{ model.name }}</p>
                <h1 class="mt-3 text-4xl font-semibold text-slate-900">{{ model.name }}</h1>
                <p class="mt-4 text-slate-600">Класс {{ model.carClass }}, кузов {{ model.bodyType }}, привод {{ model.driveType }}.</p>
              </div>

              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Основные характеристики</p>
                <div class="mt-5 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div><span class="font-semibold text-slate-900">Длина:</span> {{ model.length }} мм</div>
                  <div><span class="font-semibold text-slate-900">Ширина:</span> {{ model.width }} мм</div>
                  <div><span class="font-semibold text-slate-900">Высота:</span> {{ model.height }} мм</div>
                  <div><span class="font-semibold text-slate-900">Колёсная база:</span> {{ model.wheelbase }} мм</div>
                  <div><span class="font-semibold text-slate-900">Клиренс:</span> {{ model.clearance }} мм</div>
                  <div><span class="font-semibold text-slate-900">Объем багажника:</span> {{ model.trunkVolume }} л</div>
                </div>
              </div>

              <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Двигатель и трансмиссия</p>
                <div class="mt-5 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div><span class="font-semibold text-slate-900">Двигатель:</span> {{ model.engineType }}</div>
                  <div><span class="font-semibold text-slate-900">Объём:</span> {{ model.engineVolume }} л</div>
                  <div><span class="font-semibold text-slate-900">Мощность:</span> {{ model.enginePower }} л.с.</div>
                  <div><span class="font-semibold text-slate-900">Крутящий момент:</span> {{ model.engineTorque }} Н·м</div>
                  <div><span class="font-semibold text-slate-900">Коробка:</span> {{ model.transmission }}</div>
                  <div><span class="font-semibold text-slate-900">Цилиндры:</span> {{ model.cylindersCount ?? '—' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-10 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm uppercase tracking-[0.2em] text-slate-500">Комплектации</p>
                <h2 class="mt-2 text-2xl font-semibold text-slate-900">Выберите подходящий вариант</h2>
              </div>
              <span class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {{ configurations.length }} {{ configurations.length === 1 ? 'вариант' : 'варианта' }}
              </span>
            </div>

            <div v-if="!configurations.length" class="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
              Пока нет доступных комплектаций для этой модели.
            </div>

            <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
              <article v-for="config in configurations" :key="config.id" class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div class="space-y-4">
                  <PhotoSlider :photos="ImageHelper.getPhotoArray(config.images, PHOTO_KEYS.PHOTO_MD)" :showUpload="false" />

                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <h3 class="text-xl font-semibold text-slate-900">{{ config.name }}</h3>
                      <p class="mt-2 text-sm text-slate-600">{{ config.description }}</p>
                    </div>

                    <div class="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
                      {{ formatPrice(config.price) }}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
