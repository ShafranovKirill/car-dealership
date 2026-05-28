<script setup lang="ts">
import { ref, computed } from 'vue';
import type { BrandResponse, CarModelResponse } from '@car/types';
import { PHOTO_KEYS } from '@car/common';
import PhotoSlider from './PhotoSlider.vue';

const props = defineProps<{
  model: CarModelResponse;
  brands: BrandResponse[];
}>();

const emits = defineEmits<{
  (e: 'edit', model: CarModelResponse): void;
  (e: 'upload-photo', payload: { modelId: string; file: File }): void;
  (e: 'delete-photo', payload: { model: CarModelResponse; index: number }): void;
}>();

const expanded = ref(false);

const brandName = computed(() => props.brands.find(b => b.id === props.model.brandId)?.name || '—');
const photoKeys = computed(() => getPhotoArray(props.model.images, PHOTO_KEYS.PHOTO_MD));

function toggleExpanded() {
  expanded.value = !expanded.value;
}

function removePhoto(index: number) {
  emits('delete-photo', { model: props.model, index });
}

function getPhotoArray(photos: Record<string, any> | null | undefined, key: string): string[] {
  if (!photos) return [];
  const value = photos[key];
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
}
</script>

<template>
  <div class="bg-white rounded-lg sm:rounded-xl border p-3 sm:p-4 shadow-sm">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <div class="font-semibold text-base sm:text-lg">{{ model.name }}</div>
        <div class="text-sm sm:text-base text-gray-700 font-medium mt-1">{{ model.minPrice.toLocaleString('ru-RU') }} ₽</div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button @click="toggleExpanded" class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <span>{{ expanded ? 'Скрыть' : 'Показать' }}</span>
          <svg :class="expanded ? 'rotate-180' : ''" class="h-4 w-4 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button @click="$emit('edit', model)" class="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">
          Редактировать
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="expanded" class="mt-4 border-t border-gray-200 pt-4 text-sm sm:text-sm text-gray-600">
        <div class="space-y-4">
          <div>
            <div class="text-sm font-semibold text-gray-800 mb-2">Общее</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span class="font-medium">Название:</span> {{ model.name }}</div>
              <div><span class="font-medium">Бренд:</span> {{ brandName }}</div>
              <div><span class="font-medium">Поколение:</span> {{ model.generation || '—' }}</div>
              <div><span class="font-medium">Год:</span> {{ model.yearFrom }} {{ model.yearTo ? '- ' + model.yearTo : '' }}</div>
              <div><span class="font-medium">Тип кузова:</span> {{ model.bodyType }}</div>
              <div><span class="font-medium">Класс:</span> {{ model.carClass }}</div>
              <div><span class="font-medium">Мин. цена:</span> {{ model.minPrice.toLocaleString('ru-RU') }} ₽</div>
            </div>
          </div>

          <div>
            <div class="text-sm font-semibold text-gray-800 mb-2">Габариты</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span class="font-medium">Длина:</span> {{ model.length }} мм</div>
              <div><span class="font-medium">Ширина:</span> {{ model.width }} мм</div>
              <div><span class="font-medium">Высота:</span> {{ model.height }} мм</div>
              <div><span class="font-medium">Колесная база:</span> {{ model.wheelbase }} мм</div>
              <div><span class="font-medium">Клиренс:</span> {{ model.clearance }} мм</div>
              <div><span class="font-medium">Объем багажника:</span> {{ model.trunkVolume }} л</div>
            </div>
          </div>

          <div>
            <div class="text-sm font-semibold text-gray-800 mb-2">Двигатель</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span class="font-medium">Тип двигателя:</span> {{ model.engineType }}</div>
              <div><span class="font-medium">Объем двигателя:</span> {{ model.engineVolume }} л</div>
              <div><span class="font-medium">Мощность:</span> {{ model.enginePower }} л.с.</div>
              <div><span class="font-medium">Крутящий момент:</span> {{ model.engineTorque }} Нм</div>
              <div><span class="font-medium">Цилиндров:</span> {{ model.cylindersCount || '—' }}</div>
              <div><span class="font-medium">Трансмиссия:</span> {{ model.transmission }}</div>
              <div><span class="font-medium">Привод:</span> {{ model.driveType }}</div>
            </div>
          </div>

          <div class="mt-2">
            <PhotoSlider
              :photos="photoKeys"
              @delete="removePhoto"
              @upload="file => $emit('upload-photo', { modelId: model.id, file })"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
