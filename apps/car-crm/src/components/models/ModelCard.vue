<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { BrandResponse, CarModelResponse, CreateConfigurationRequest } from '@car/types';
import { SocketEvent } from '@car/types';
import { PHOTO_KEYS } from '@car/common';
import { socket } from '@/plugins/socket';
import { useConfigurationStore } from '@/stores/configuration.store';

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
const configStore = useConfigurationStore();
const configModalMode = ref<'create' | 'edit'>('create');
const showConfigModal = ref(false);
const editingConfig = ref<any>(null);
const configSaving = ref(false);
const configurations = ref<any[]>([]);
const configLoading = ref(false);

const brandName = computed(() => props.brands.find(b => b.id === props.model.brandId)?.name || '—');

// Load configurations when card is expanded
async function loadConfigurations() {
  configLoading.value = true;
  try {
    const data = await configStore.fetchByModelId(props.model.id);
    configurations.value = data || [];
  } catch (error) {
    console.error('Failed to load configurations:', error);
    configurations.value = [];
  } finally {
    configLoading.value = false;
  }
}

// Watch for expanded state to load configurations
watch(expanded, async (newValue) => {
  if (newValue) {
    await loadConfigurations();
  }
});

function editConfig(config: any) {
  editingConfig.value = config;
  configModalMode.value = 'edit';
  showConfigModal.value = true;
}

async function deleteConfig(configId: string) {
  if (!confirm('Вы уверены, что хотите удалить эту комплектацию?')) {
    return;
  }
  try {
    await configStore.remove(configId);
    configurations.value = configurations.value.filter(c => c.id !== configId);
  } catch (error) {
    console.error('Failed to delete configuration:', error);
  }
}

async function saveConfiguration(payload: any) {
  configSaving.value = true;
  try {
    if (configModalMode.value === 'create') {
      const newConfig = await configStore.create({
        carModelId: props.model.id,
        name: payload.name,
        price: payload.price,
        description: payload.description,
      } as CreateConfigurationRequest);
      configurations.value.push(newConfig);
    } else if (editingConfig.value) {
      await configStore.update(editingConfig.value.id, {
        name: payload.name,
        price: payload.price,
        description: payload.description,
      });
      const index = configurations.value.findIndex(c => c.id === editingConfig.value.id);
      if (index !== -1) {
        configurations.value[index] = {
          ...configurations.value[index],
          name: payload.name,
          price: payload.price,
          description: payload.description,
        };
      }
    }
    showConfigModal.value = false;
    editingConfig.value = null;
  } catch (error) {
    console.error('Failed to save configuration:', error);
  } finally {
    configSaving.value = false;
  }
}

async function uploadConfigPhoto(payload: { configurationId: string; file: File; photoKey: string }) {
  try {
    await configStore.uploadPhoto(payload.configurationId, payload.file);
    // Reload configuration after photo upload
    const updatedConfig = await configStore.fetchOne(payload.configurationId);
    const index = configurations.value.findIndex(c => c.id === payload.configurationId);
    if (index !== -1) {
      configurations.value[index] = updatedConfig;
    }
    // Reload editing config if it's the one being edited
    if (editingConfig.value?.id === payload.configurationId) {
      editingConfig.value = updatedConfig;
    }
  } catch (error) {
    console.error('Failed to upload configuration photo:', error);
  }
}

async function deleteConfigPhoto(payload: { configurationId: string; photoKey: string }) {
  try {
    await configStore.deletePhoto(payload.configurationId, payload.photoKey);
    // Reload configuration after photo deletion
    const updatedConfig = await configStore.fetchOne(payload.configurationId);
    const index = configurations.value.findIndex(c => c.id === payload.configurationId);
    if (index !== -1) {
      configurations.value[index] = updatedConfig;
    }
    // Reload editing config if it's the one being edited
    if (editingConfig.value?.id === payload.configurationId) {
      editingConfig.value = updatedConfig;
    }
  } catch (error) {
    console.error('Failed to delete configuration photo:', error);
  }
}

// Socket listener for configuration photo updates
function setupSocketListener() {
  const handlePhotoUpload = async () => {
    // Reload all configurations for the model when a photo is uploaded
    if (expanded.value && props.model.id) {
      await loadConfigurations();
    }
  };

  socket?.on(SocketEvent.PHOTO_EDIT_RESULT, handlePhotoUpload);

  return () => {
    socket?.off(SocketEvent.PHOTO_EDIT_RESULT, handlePhotoUpload);
  };
}

let unsubscribeSocket: (() => void) | null = null;

onMounted(() => {
  unsubscribeSocket = setupSocketListener();
});

onUnmounted(() => {
  unsubscribeSocket?.();
});

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
              @upload="(file: any) => $emit('upload-photo', { modelId: model.id, file })"
            />
          </div>

          <div class="mt-4">
            <ConfigurationList
              :configurations="configurations"
              :loading="configLoading"
              @add="showConfigModal = true; configModalMode = 'create'"
              @edit="editConfig"
              @delete="deleteConfig"
            />
          </div>
        </div>
      </div>
    </transition>

    <ConfigurationModal
      :visible="showConfigModal"
      :mode="configModalMode"
      :configuration="editingConfig"
      :loading="configSaving"
      @close="showConfigModal = false"
      @save="saveConfiguration"
      @upload-photo="uploadConfigPhoto"
      @delete-photo="deleteConfigPhoto"
    />
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
