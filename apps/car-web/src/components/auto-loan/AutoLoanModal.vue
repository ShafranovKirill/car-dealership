<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useModelStore } from '@/stores/model.store'
import AutoLoanCalculator from './AutoLoanCalculator.vue'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const modelStore = useModelStore()
const selectedModelId = ref<string>('')
const models = computed(() => modelStore.models)
const isLoading = computed(() => modelStore.isLoading)

onMounted(() => {
  if (models.value.length === 0) {
    modelStore.fetchAll(1, 50)
  }
})

const handleModelSelect = (modelId: string) => {
  selectedModelId.value = modelId
}

const closeModal = () => {
  emit('update:show', false)
  selectedModelId.value = ''
}
</script>

<template>
  <teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-100"
        @click.stop
      >
        <!-- Header -->
        <div class="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 class="text-2xl font-bold text-slate-900">
            Расчёт автокредита
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="space-y-6">
            <!-- Model Selection -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-3">
                Выберите модель автомобиля
              </label>
              <div v-if="isLoading" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <select
                v-else
                @change="(e) => handleModelSelect((e.target as HTMLSelectElement).value)"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                <option value="">-- Выберите модель --</option>
                <option
                  v-for="model in models"
                  :key="model.id"
                  :value="model.id"
                >
                  {{ model.name }} ({{ model.yearFrom }})
                </option>
              </select>
            </div>

            <!-- Calculator -->
            <auto-loan-calculator
              v-if="selectedModelId"
              :key="selectedModelId"
              :model-id="selectedModelId"
              @close="closeModal"
            />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
