<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { BrandResponse, CarModelResponse, CreateCarModelRequest } from '@car/types';

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  mode: 'create' | 'edit';
  model?: CarModelResponse | null;
  brands: BrandResponse[];
  loading: boolean;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'save', dto: Partial<CreateCarModelRequest>): void;
}>();

const BODY_TYPES = ['SEDAN','HATCHBACK','SUV','WAGON','COUPE','MINIVAN','PICKUP'];
const CAR_CLASSES = ['A','B','C','D','E','F','J','M','S'];
const ENGINE_TYPES = ['BENZIN','DIESEL','HYBRID','ELECTRIC'];
const TRANSMISSIONS = ['MANUAL','AUTOMATIC','ROBOT','VARIATOR'];
const DRIVE_TYPES = ['FWD','RWD','AWD'];

const form = ref<Partial<CreateCarModelRequest>>({
  name: '',
  generation: '',
  yearFrom: new Date().getFullYear(),
  bodyType: 'SEDAN',
  carClass: 'C',
  minPrice: 0,
  brandId: '',
  length: 0,
  width: 0,
  height: 0,
  wheelbase: 0,
  clearance: 0,
  trunkVolume: 0,
  engineType: 'BENZIN',
  engineVolume: 0,
  enginePower: 0,
  engineTorque: 0,
  transmission: 'AUTOMATIC',
  driveType: 'FWD',
});

const title = computed(() => (props.mode === 'edit' ? t('model.edit') : t('model.create')));

function resetForm() {
  form.value = {
    name: '',
    generation: '',
    yearFrom: new Date().getFullYear(),
    bodyType: 'SEDAN',
    carClass: 'C',
    minPrice: 0,
    brandId: '',
    length: 0,
    width: 0,
    height: 0,
    wheelbase: 0,
    clearance: 0,
    trunkVolume: 0,
    engineType: 'BENZIN',
    engineVolume: 0,
    enginePower: 0,
    engineTorque: 0,
    transmission: 'AUTOMATIC',
    driveType: 'FWD',
  };
}

function prepareForm() {
  if (props.mode === 'edit' && props.model) {
    form.value = {
      name: props.model.name,
      generation: props.model.generation || '',
      yearFrom: props.model.yearFrom,
      bodyType: props.model.bodyType,
      carClass: props.model.carClass,
      minPrice: props.model.minPrice,
      brandId: props.model.brandId,
      length: props.model.length,
      width: props.model.width,
      height: props.model.height,
      wheelbase: props.model.wheelbase,
      clearance: props.model.clearance,
      trunkVolume: props.model.trunkVolume,
      engineType: props.model.engineType,
      engineVolume: props.model.engineVolume,
      enginePower: props.model.enginePower,
      engineTorque: props.model.engineTorque,
      cylindersCount: props.model.cylindersCount?? 0,
      transmission: props.model.transmission,
      driveType: props.model.driveType,
    };    return;
  }

  resetForm();
}

watch(
  () => [props.visible, props.mode, props.model],
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
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
    <div class="bg-white rounded-t-xl sm:rounded-xl shadow-lg w-full sm:max-w-2xl sm:my-8 max-h-[90vh] sm:max-h-none flex flex-col">
      <div class="sticky top-0 p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl sm:rounded-t-xl">
        <h2 class="text-lg sm:text-xl font-bold">{{ title }}</h2>
        <button @click="onClose" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">✕</button>
      </div>

      <div class="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.name') }} *</label>
            <input v-model="form.name" type="text" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.generation') }}</label>
            <input v-model="form.generation" type="text" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.year') }}</label>
            <input v-model.number="form.yearFrom" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.brand') }} *</label>
            <select v-model="form.brandId" class="input w-full">
              <option value="">{{ t('model.selectBrand') }}</option>
              <option v-for="brand in props.brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.bodyType') }}</label>
            <select v-model="form.bodyType" class="input w-full">
              <option v-for="type in BODY_TYPES" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.class') }}</label>
            <select v-model="form.carClass" class="input w-full">
              <option v-for="carClass in CAR_CLASSES" :key="carClass" :value="carClass">{{ carClass }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.minPrice') }} (₽)</label>
            <input v-model.number="form.minPrice" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.length') }} (мм)</label>
            <input v-model.number="form.length" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.width') }} (мм)</label>
            <input v-model.number="form.width" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.height') }} (мм)</label>
            <input v-model.number="form.height" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.wheelbase') }} (мм)</label>
            <input v-model.number="form.wheelbase" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.clearance') }} (мм)</label>
            <input v-model.number="form.clearance" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.trunkVolume') }} (л)</label>
            <input v-model.number="form.trunkVolume" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.engineType') }}</label>
            <select v-model="form.engineType" class="input w-full">
              <option v-for="engineType in ENGINE_TYPES" :key="engineType" :value="engineType">{{ engineType }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.engineVolume') }} (л)</label>
            <input v-model.number="form.engineVolume" type="number" step="0.1" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.enginePower') }} (л.с.)</label>
            <input v-model.number="form.enginePower" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.engineTorque') }} (Нм)</label>
            <input v-model.number="form.engineTorque" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.cylinders') }}</label>
            <input v-model.number="form.cylindersCount" type="number" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.transmission') }}</label>
            <select v-model="form.transmission" class="input w-full">
              <option v-for="transmission in TRANSMISSIONS" :key="transmission" :value="transmission">{{ transmission }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('model.drive') }}</label>
            <select v-model="form.driveType" class="input w-full">
              <option v-for="driveType in DRIVE_TYPES" :key="driveType" :value="driveType">{{ driveType }}</option>
            </select>
          </div>
        </div>
      </div>

        <div class="sticky bottom-0 p-4 sm:p-6 border-t border-gray-200 flex gap-2 sm:gap-3 justify-end bg-white">
        <button @click="onClose" class="px-3 sm:px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm sm:text-base">
          {{ t('configuration.cancel') }}
        </button>
        <button @click="onSave" :disabled="loading" class="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm sm:text-base">
          {{ loading ? (props.mode === 'edit' ? t('configuration.saving') : t('configuration.creating')) : (props.mode === 'edit' ? t('configuration.save') : t('configuration.create')) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: inherit;
}
</style>
