<script setup lang="ts">
import type { ConfigurationResponse } from '@car/types';
import { ImageHelper } from '@/utils/image.utils';

const props = defineProps<{
  configurations: ConfigurationResponse[];
  loading: boolean;
}>();

const emits = defineEmits<{
  (e: 'add'): void;
  (e: 'edit', config: ConfigurationResponse): void;
  (e: 'delete', configId: string): void;
}>();

function confirmDelete(configId: string) {
  if (confirm('Вы уверены, что хотите удалить эту комплектацию?')) {
    emits('delete', configId);
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Комплектации</h3>
      <button
        @click="$emit('add')"
        :disabled="loading"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
      >
        + Добавить комплектацию
      </button>
    </div>

    <div v-if="loading" class="text-center py-4 text-gray-500">Загрузка...</div>
    <div v-else-if="!configurations.length" class="text-center py-6 text-gray-500">
      Комплектаций нет. Нажмите "Добавить комплектацию" чтобы создать первую.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="config in configurations"
        :key="config.id"
        class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex gap-4 p-4">
          <!-- Photo Thumbnail -->
          <div class="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <img
              v-if="config.images?.['photo-md']"
              :src="ImageHelper.generatePublicUrl(config.images['photo-md']) || ''"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center text-xs text-gray-400">
              Нет фото
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h4 class="font-semibold text-gray-900">{{ config.name }}</h4>
                <p class="text-sm text-gray-600">{{ config.price.toLocaleString('ru-RU') }} ₽</p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="$emit('edit', config)"
                  :disabled="loading"
                  class="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Редактировать
                </button>
                <button
                  @click="confirmDelete(config.id)"
                  :disabled="loading"
                  class="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Удалить
                </button>
              </div>
            </div>
            <p class="mt-2 line-clamp-2 text-sm text-gray-600">{{ config.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
