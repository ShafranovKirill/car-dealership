<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import { ImageHelper } from '@/utils/image.utils';
  const { t } = useI18n();

const props = defineProps({
  photos: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  showUpload: {
    type: Boolean,
    default: false,
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
    <div class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <div v-if="activePhoto" class="relative h-48 sm:h-64 bg-slate-100 flex items-center justify-center">
        <img :src="ImageHelper.generatePublicUrl(activePhoto) || ''" class="max-h-full max-w-full object-contain" />
        <button @click="prevPhoto" class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm text-slate-700 hover:bg-white">
          ‹
        </button>
        <button @click="nextPhoto" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm text-slate-700 hover:bg-white">
          ›
        </button>
        <button v-if="showUpload" @click="openFileInput" class="absolute top-2 left-2 rounded-full bg-white/80 p-2 text-slate-700 hover:bg-white">+</button>
        <button v-if="showUpload" @click="deletePhoto" class="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white text-xs hover:bg-black/80">
          {{ t('common.delete') }}
        </button>
      </div>

      <div v-else class="flex h-48 sm:h-64 items-center justify-center p-4 text-center text-sm text-slate-500">
        {{ t('configuration.noPhotos') }}
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="(photo, index) in props.photos"
        :key="index"
        @click="selectPhoto(index)"
        class="h-16 w-24 overflow-hidden rounded-lg border transition duration-150 ease-in-out"
        :class="index === activeIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'"
      >
        <img :src="ImageHelper.generatePublicUrl(photo) || ''" class="h-full w-full object-cover" />
      </button>
    </div>

    <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" class="hidden" />
  </div>
</template>

<style scoped>
button:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
