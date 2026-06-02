<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ConfigurationResponse, CreateConfigurationRequest } from '@car/types';
import { PHOTO_KEYS } from '@car/common';

const props = defineProps<{
  visible: boolean;
  mode: 'create' | 'edit';
  configuration?: ConfigurationResponse | null;
  loading: boolean;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'save', dto: Partial<CreateConfigurationRequest>): void;
  (e: 'upload-photo', payload: { configurationId: string; file: File; photoKey: string }): void;
  (e: 'delete-photo', payload: { configurationId: string; photoKey: string }): void;
}>();

const form = ref<Partial<CreateConfigurationRequest>>({
  name: '',
  price: 0,
  description: '',
});

const { t } = useI18n();

const title = computed(() => (props.mode === 'edit' ? t('configuration.edit') : t('configuration.create')));

function resetForm() {
  form.value = {
    name: '',
    price: 0,
    description: '',
  };
}

function prepareForm() {
  if (props.mode === 'edit' && props.configuration) {
    form.value = {
      name: props.configuration.name,
      price: props.configuration.price,
      description: props.configuration.description,
    };
    return;
  }
  resetForm();
}

watch(
  () => [props.visible, props.mode, props.configuration],
  ([visible]) => {
    if (visible) {
      prepareForm();
    }
  },
  { immediate: true }
);

function onClose() {
  emits('close');
}

function onSave() {
  emits('save', form.value);
}

function getPhotoArray(photos: Record<string, any> | null | undefined, key: string): string[] {
  if (!photos) return [];
  const value = photos[key];
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
}

const photoKeys = computed(() =>
  props.mode === 'edit' && props.configuration
    ? getPhotoArray(props.configuration.images, PHOTO_KEYS.PHOTO_MD)
    : []
);
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
    <div class="bg-white rounded-t-xl sm:rounded-xl shadow-lg w-full sm:max-w-2xl sm:my-8 max-h-[90vh] sm:max-h-none flex flex-col">
      <div class="sticky top-0 p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl">
        <h2 class="text-lg sm:text-xl font-bold">{{ title }}</h2>
        <button @click="onClose" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">✕</button>
      </div>

      <div class="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('configuration.name') }} {{ t('common.required') }}</label>
          <input v-model="form.name" type="text" class="input w-full" :placeholder="t('configuration.namePlaceholder')" />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('configuration.price') }} {{ t('common.required') }}</label>
          <input v-model.number="form.price" type="number" class="input w-full" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('configuration.description') }}</label>
          <textarea v-model="form.description" class="input w-full" rows="4" :placeholder="t('configuration.descriptionPlaceholder')"></textarea>
        </div>

        <!-- Photos (only in edit mode) -->
        <div v-if="mode === 'edit' && configuration">
          <label class="block text-sm font-medium text-gray-700 mb-3">{{ t('configuration.photos') }}</label>
          <PhotoSlider
            :photos="photoKeys"
            @delete="() => $emit('delete-photo', { configurationId: configuration!.id, photoKey: PHOTO_KEYS.PHOTO_MD })"
            @upload="(file: any) => $emit('upload-photo', { configurationId: configuration!.id, file, photoKey: PHOTO_KEYS.PHOTO_MD })"
          />
        </div>
      </div>

      <div class="sticky bottom-0 p-4 sm:p-6 border-t border-gray-200 flex gap-2 sm:gap-3 justify-end bg-white">
        <button @click="onClose" :disabled="loading" class="px-3 sm:px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm sm:text-base disabled:bg-gray-100">
          {{ t('configuration.cancel') }}
        </button>
        <button @click="onSave" :disabled="loading || !form.name || !form.price" class="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm sm:text-base">
          {{ loading ? (mode === 'edit' ? t('configuration.saving') : t('configuration.creating')) : (mode === 'edit' ? t('configuration.save') : t('configuration.create')) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: inherit;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@media (max-width: 640px) {
  .input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
