<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useModelStore } from '@/stores/model.store'

interface Props {
  modelId: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modelStore = useModelStore()

// Loan parameters
const carPrice = ref<number>(0)
const downPaymentPercent = ref<number>(20)
const loanTermMonths = ref<number>(60)
const annualInterestRate = ref<number>(12)

// CB Russia key rate (default)
const cbRate = ref<number>(18)

// Results
const downPaymentAmount = computed(() => (carPrice.value * downPaymentPercent.value) / 100)
const loanAmount = computed(() => carPrice.value - downPaymentAmount.value)
const monthlyInterestRate = computed(() => annualInterestRate.value / 100 / 12)

// Monthly payment calculation (annuity formula - standard in RF)
const monthlyPayment = computed(() => {
  if (loanAmount.value === 0 || monthlyInterestRate.value === 0) return 0

  const rate = monthlyInterestRate.value
  const n = loanTermMonths.value
  const principal = loanAmount.value

  // Annuity payment formula: A = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const numerator = rate * Math.pow(1 + rate, n)
  const denominator = Math.pow(1 + rate, n) - 1
  return principal * (numerator / denominator)
})

const totalPayment = computed(() => monthlyPayment.value * loanTermMonths.value)
const totalInterestPaid = computed(() => totalPayment.value - loanAmount.value)

// Insurance (obligatory in RF for auto loans)
const insuranceCost = computed(() => carPrice.value * 0.08) // ~8% per year for 5 years = 40%
const insuranceMonthly = computed(() => insuranceCost.value / loanTermMonths.value)

// Effective rate including insurance (approximation)
const effectiveMonthlyPayment = computed(() => monthlyPayment.value + insuranceMonthly.value)
const effectiveTotalPayment = computed(() => effectiveMonthlyPayment.value * loanTermMonths.value)

// UFMR calculation (Uniform Finance Margin Rate per CBR regulation)
const ufmr = computed(() => cbRate.value + 5) // Banks typically add 5-7 points

// Validation
const isValidCalculation = computed(() => {
  return carPrice.value > 0 && loanTermMonths.value > 0 && annualInterestRate.value > 0
})

onMounted(() => {
  const selectedModel = modelStore.selectedModel
  if (selectedModel) {
    carPrice.value = selectedModel.minPrice
  }
})

// Watch for changes to selectedModel to ensure price is updated
const updatePriceFromModel = async () => {
  const selectedModel = modelStore.selectedModel
  if (selectedModel && selectedModel.minPrice > 0) {
    carPrice.value = selectedModel.minPrice
  }
}

// Update price when component is mounted or model changes
onMounted(() => {
  updatePriceFromModel()
})

// Also watch for model ID prop changes with immediate update
watch(() => props.modelId, async (newModelId) => {
  if (newModelId) {
    console.log('🔄 AutoLoanCalculator: modelId changed to', newModelId)
    // Fetch the model if not already loaded
    await modelStore.fetchOne(newModelId)
    console.log('✅ Model loaded:', modelStore.selectedModel?.name, 'Price:', modelStore.selectedModel?.minPrice)
    // Small delay to ensure store is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    // Then update the price
    await updatePriceFromModel()
    console.log('💰 Price updated to:', carPrice.value)
  }
}, { immediate: false })

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Car Price -->
    <div>
      <label class="block text-sm font-semibold text-slate-700 mb-2">
        Стоимость автомобиля, ₽
      </label>
      <input
        v-model.number="carPrice"
        type="number"
        class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>

    <!-- Down Payment -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">
          Первоначальный взнос, %
        </label>
        <input
          v-model.number="downPaymentPercent"
          type="number"
          min="10"
          max="100"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">
          Сумма, ₽
        </label>
        <div class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-900">
          {{ formatCurrency(downPaymentAmount) }}
        </div>
      </div>
    </div>

    <!-- Loan Term and Interest Rate -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">
          Срок кредита, месяцев
        </label>
        <select
          v-model.number="loanTermMonths"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option :value="24">24 месяца</option>
          <option :value="36">36 месяцев</option>
          <option :value="48">48 месяцев</option>
          <option :value="60">60 месяцев</option>
          <option :value="72">72 месяца</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">
          Процентная ставка, %
        </label>
        <input
          v-model.number="annualInterestRate"
          type="number"
          step="0.1"
          min="5"
          max="30"
          class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>

    <!-- CB Rate Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-xs text-slate-600 mb-2">
        <strong>ℹ️ Информация:</strong> Ставка рефинансирования ЦБ РФ: {{ cbRate }}%
      </p>
      <p class="text-xs text-slate-600">
        UFMR (предельная ставка): ~{{ ufmr }}% годовых (согласно регламенту ЦБ РФ)
      </p>
    </div>

    <!-- Results -->
    <div v-if="isValidCalculation" class="space-y-4">
      <div class="border-t border-slate-200 pt-4">
        <h3 class="font-semibold text-slate-900 mb-4">Результаты расчёта</h3>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 p-3 rounded-lg">
            <p class="text-xs text-slate-600 mb-1">Сумма кредита</p>
            <p class="text-lg font-bold text-slate-900">{{ formatCurrency(loanAmount) }}</p>
          </div>

          <div class="bg-slate-50 p-3 rounded-lg">
            <p class="text-xs text-slate-600 mb-1">Ежемесячный платёж</p>
            <p class="text-lg font-bold text-blue-600">{{ formatCurrency(monthlyPayment) }}</p>
          </div>

          <div class="bg-slate-50 p-3 rounded-lg">
            <p class="text-xs text-slate-600 mb-1">Переплата процентов</p>
            <p class="text-lg font-bold text-orange-600">{{ formatCurrency(totalInterestPaid) }}</p>
          </div>

          <div class="bg-slate-50 p-3 rounded-lg">
            <p class="text-xs text-slate-600 mb-1">Сумма страховки/год</p>
            <p class="text-lg font-bold text-slate-600">{{ formatCurrency(insuranceCost / 5) }}</p>
          </div>
        </div>

        <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-xs text-slate-600 mb-1">Итого к оплате (основной долг + проценты)</p>
          <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalPayment) }}</p>
          <p class="text-xs text-slate-600 mt-2">
            с учётом обязательного страхования: {{ formatCurrency(effectiveTotalPayment) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
