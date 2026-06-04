<script setup lang="ts">
import { computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDriveTestStore } from '@/stores/drive-test.store'
import { storeToRefs } from 'pinia'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const toast = useToast()
const store = useDriveTestStore()
const { brands, filteredModels, selectedBrandId, selectedModelId, clientPhone, scheduledAt, isLoading, submitLoading, error, success } = storeToRefs(store)

const showModal = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const close = () => {
  showModal.value = false
  store.clearForm()
}

const submit = async () => {
  const result = await store.submit()
  if (result) {
    toast.add({
      severity: 'success',
      summary: 'Успешно!',
      detail: 'Заявка на тест-драйв создана. Мы скоро свяжемся с вами.',
      life: 3000,
    })
    showModal.value = false
  }
}

watch(
  () => props.show,
  async opened => {
    if (opened) {
      await store.loadOptions()
      store.error = ''
      store.success = ''
    }
  },
)
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6 sm:px-6">
    <div class="w-full max-w-2xl rounded-4xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
      <div class="flex items-center justify-between pb-4">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Запись на тест-драйв</h2>
          <p class="mt-2 text-sm text-slate-600">Укажите марку, модель, номер телефона и удобную дату.</p>
        </div>
        <button @click="close" type="button" class="text-slate-400 transition hover:text-slate-700">✕</button>
      </div>

      <div v-if="isLoading" class="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">Загрузка данных...</div>

      <div v-else class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="block text-sm font-semibold text-slate-700">Марка автомобиля</span>
            <select
              class="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              v-model="selectedBrandId"
            >
              <option value="">Выберите марку</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
            </select>
          </label>

          <label class="block">
            <span class="block text-sm font-semibold text-slate-700">Модель</span>
            <select
              class="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              v-model="selectedModelId"
              :disabled="!selectedBrandId"
            >
              <option value="">Выберите модель</option>
              <option v-for="model in filteredModels" :key="model.id" :value="model.id">{{ model.name }}</option>
            </select>
          </label>
        </div>

        <label class="block">
          <span class="block text-sm font-semibold text-slate-700">Телефон</span>
          <input
            v-model="clientPhone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            class="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label class="block">
          <span class="block text-sm font-semibold text-slate-700">Дата и время</span>
          <input
            v-model="scheduledAt"
            type="datetime-local"
            class="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div v-if="error" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</div>
        <div v-if="success" class="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            @click="submit"
            type="button"
            :disabled="submitLoading || !selectedModelId || !clientPhone"
            class="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {{ submitLoading ? 'Отправка...' : 'Отправить заявку' }}
          </button>
          <button
            @click="close"
            type="button"
            class="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
