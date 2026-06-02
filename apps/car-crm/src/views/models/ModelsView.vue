<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useModelStore } from '@/stores/model.store';
import { useBrandStore } from '@/stores/brand.store';
import type { CarModelResponse, CreateCarModelRequest, UpdateCarModelRequest } from '@car/types';
import { PHOTO_KEYS } from '@car/common';
import { SocketEvent } from '@car/types';
import { socket } from '@/plugins/socket';

const { t } = useI18n();


const store = useModelStore();
const brandStore = useBrandStore();

const creating = ref(false);
const modalMode = ref<'create' | 'edit' | null>(null);
const editingModel = ref<CarModelResponse | null>(null);

onMounted(() => {
  store.fetchAll();
  brandStore.fetchAll();

  socket.on(SocketEvent.PHOTO_EDIT_RESULT, (data: { success: boolean; modelId?: string }) => {
    if (data.success) {
      store.fetchAll();
    }
  });
});

onUnmounted(() => {
  socket.off(SocketEvent.PHOTO_EDIT_RESULT);
});

function openCreateModal() {
  modalMode.value = 'create';
  editingModel.value = null;
}

function openEditModal(model: CarModelResponse) {
  editingModel.value = model;
  modalMode.value = 'edit';
}

function closeModal() {
  modalMode.value = null;
  editingModel.value = null;
}

async function saveModel(dto: Partial<CreateCarModelRequest>) {
  if (creating.value) return;
  if (!dto.name || !dto.brandId) return;

  creating.value = true;
  try {
    if (modalMode.value === 'edit' && editingModel.value) {
      await store.update({
        modelId: editingModel.value.id,
        ...dto,
      } as UpdateCarModelRequest);
    } else {
      await store.create(dto as CreateCarModelRequest);
    }
    closeModal();
  } finally {
    creating.value = false;
  }
}

async function uploadPhoto(payload: { modelId: string; file: File }) {
  await store.uploadPhoto(payload.modelId, payload.file, socket.id || '');
}

async function deletePhoto(payload: { model: CarModelResponse; index: number }) {
  const originals = getPhotoArray((payload.model as any).images, PHOTO_KEYS.PRODUCT_ORIGINAL);
  const fileKey = originals[payload.index];
  if (!fileKey) {
    alert(t('models.keyError'));
    return;
  }
  if (!confirm(t('models.deleteConfiguration'))) return;
  await store.deletePhoto(payload.model.id, fileKey);
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
  <section class="max-w-6xl mx-auto p-2 sm:p-4 lg:p-8 antialiased text-gray-800">
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">{{ t('models.title') }}</h1>
        <p class="text-xs sm:text-sm text-gray-500">{{ t('models.subtitle') }}</p>
      </div>
      <button @click="openCreateModal" class="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap">
        + {{ t('models.add') }}
      </button>
    </div>

    <ModelModal
      v-if="modalMode !== null"
      :visible="modalMode !== null"
      :mode="modalMode"
      :model="editingModel"
      :brands="brandStore.brands"
      :loading="creating"
      @close="closeModal"
      @save="saveModel"
    />

    <div v-if="store.isLoading" class="py-12 text-center">{{ t('common.loading') }}</div>

    <div v-else>
      <div v-if="!store.models.length" class="text-center py-12">{{ t('models.title') }}</div>

      <div v-else class="grid gap-3 sm:gap-4">
        <ModelCard
          v-for="model in store.models"
          :key="model.id"
          :model="model"
          :brands="brandStore.brands"
          @edit="openEditModal"
          @upload-photo="uploadPhoto"
          @delete-photo="deletePhoto"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.input { 
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb; 
  border-radius: 0.375rem;
  font-size: inherit;
}

@media (max-width: 640px) {
  .input {
    padding: 0.5rem 0.375rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
