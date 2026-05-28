<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { ImageHelper } from '@/utils/image.utils';

const props = defineProps({
  photos: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  showUpload: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits<{
  (e: 'delete', index: number): void;
  (e: 'upload', file: File): void;
}>();

const activeIndex = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.photos.length,
  (length) => {
    if (activeIndex.value >= length) {
      activeIndex.value = Math.max(0, length - 1);
    }
  },
  { immediate: true }
);

const activePhoto = computed(() => props.photos[activeIndex.value] || null);

function prevPhoto() {
  if (props.photos.length === 0) return;
  activeIndex.value = (activeIndex.value - 1 + props.photos.length) % props.photos.length;
}

function nextPhoto() {
  if (props.photos.length === 0) return;
  activeIndex.value = (activeIndex.value + 1) % props.photos.length;
}

function selectPhoto(index: number) {
  activeIndex.value = index;
}

function openFileInput() {
  fileInput.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  emits('upload', file);
  input.value = '';
}

function deletePhoto() {
  if (props.photos.length === 0) return;
  emits('delete', activeIndex.value);
}
</script>

<template>
  <div class="space-y-3">
    <div class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <div v-if="activePhoto" class="relative h-52 sm:h-64 bg-gray-100 flex items-center justify-center">
        <img :src="ImageHelper.generatePublicUrl(activePhoto) || ''" class="max-h-full max-w-full object-contain" />
        <button @click="prevPhoto" class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm text-gray-700 hover:bg-white">
          ‹
        </button>
        <button @click="nextPhoto" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm text-gray-700 hover:bg-white">
          ›
        </button>
        <button @click="deletePhoto" class="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white text-xs hover:bg-black/80">
          Удалить
        </button>
      </div>

      <div v-else class="flex h-52 sm:h-64 items-center justify-center p-4 text-center text-sm text-gray-500">
        Нет фотографий
      </div>
    </div>

    <div class="flex items-center justify-between gap-2">
      <div class="flex-1 overflow-x-auto">
        <div class="flex gap-2 pb-1">
          <button
            v-for="(photo, index) in photos"
            :key="index"
            @click="selectPhoto(index)"
            class="h-16 w-16 overflow-hidden rounded-lg border transition duration-150 ease-in-out"
            :class="index === activeIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'"
          >
            <img :src="ImageHelper.generatePublicUrl(photo) || ''" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>
      <button
        v-if="showUpload"
        @click="openFileInput"
        class="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-blue-500 hover:text-blue-700"
      >
        + Загрузить
      </button>
      <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" class="hidden" />
    </div>
  </div>
</template>

<style scoped>
button:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
