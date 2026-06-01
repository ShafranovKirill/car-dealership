<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useDriveTestStore } from '@/stores/drive-test.store';
import { useModelStore } from '@/stores/model.store';
import { useBrandStore } from '@/stores/brand.store';
import type { CreateDriveTestRequest, UpdateDriveTestRequest } from '@/stores/drive-test.store';

const driveTestStore = useDriveTestStore();
const modelStore = useModelStore();
const brandStore = useBrandStore();

const showCreateDialog = ref(false);
const showUpdateDialog = ref(false);
const selectedTab = ref<'all' | 'new' | 'confirmed' | 'canceled'>('all');
const editingTest = ref<any>(null);
const selectedBrandId = ref('');

const newForm = ref<CreateDriveTestRequest>({
  clientPhone: '',
  carModelId: '',
  scheduledAt: undefined,
});

const availableModels = computed(() => {
  if (!selectedBrandId.value) {
    return [];
  }
  return modelStore.models.filter((model) => model.brandId === selectedBrandId.value);
});

const updateForm = ref<UpdateDriveTestRequest>({
  driveTestId: '',
  status: undefined,
  scheduledAt: undefined,
});

const filteredTests = computed(() => {
  switch (selectedTab.value) {
    case 'new':
      return driveTestStore.newDriveTests;
    case 'confirmed':
      return driveTestStore.confirmedDriveTests;
    case 'canceled':
      return driveTestStore.canceledDriveTests;
    default:
      return driveTestStore.driveTests;
  }
});

onMounted(async () => {
  await brandStore.fetchAll();
  await modelStore.fetchAll();
  await driveTestStore.fetchAll();
});

function resetNewForm() {
  selectedBrandId.value = '';
  newForm.value = {
    clientPhone: '',
    carModelId: '',
    scheduledAt: undefined,
  };
}

async function createDriveTest() {
  if (!newForm.value.clientPhone.trim() || !newForm.value.carModelId || !selectedBrandId.value) {
    alert('Заполните все обязательные поля');
    return;
  }

  try {
    await driveTestStore.create(newForm.value);
    showCreateDialog.value = false;
    resetNewForm();
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    alert('Ошибка при создании заявки');
  }
}

function onBrandChange() {
  newForm.value.carModelId = '';
}

function openUpdateDialog(test: any) {
  editingTest.value = test;
  updateForm.value = {
    driveTestId: test.id,
    status: test.status,
    scheduledAt: test.scheduledAt || undefined,
  };
  showUpdateDialog.value = true;
}

async function updateDriveTest() {
  try {
    await driveTestStore.update(updateForm.value);
    showUpdateDialog.value = false;
    editingTest.value = null;
  } catch (error) {
    console.error('Ошибка при обновлении заявки:', error);
    alert('Ошибка при обновлении заявки');
  }
}

async function removeDriveTest(id: string) {
  if (!confirm('Удалить заявку на тест-драйв?')) return;
  try {
    await driveTestStore.remove(id);
  } catch (error) {
    console.error('Ошибка при удалении заявки:', error);
    alert('Ошибка при удалении заявки');
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'NEW':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'CANCELED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'NEW':
      return 'Новая';
    case 'CONFIRMED':
      return 'Подтверждена';
    case 'CANCELED':
      return 'Отменена';
    default:
      return status;
  }
}

function getCarModelName(test: any) {
  if (test.carModel) {
    const brand = brandStore.brands.find(b => b.id === test.carModel.brandId);
    const brandName = brand?.name || '';
    return `${brandName} ${test.carModel.name}`.trim();
  }
  return 'Неизвестная модель';
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRowClass(test: any) {
  if (test.status === 'NEW') {
    return 'bg-yellow-50 border-l-4 border-yellow-400';
  }
  return '';
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 antialiased text-gray-800">
    <!-- Заголовок -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Заявки на тест-драйв</h1>
        <p class="text-sm sm:text-base text-gray-500 mt-1">Управление заявками и расписание тест-драйвов</p>
      </div>
      <button
        @click="showCreateDialog = true"
        class="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        + Новая заявка
      </button>
    </div>

    <!-- Вкладки -->
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button
        v-for="tab in ['all', 'new', 'confirmed', 'canceled']"
        :key="tab"
        @click="selectedTab = tab as any"
        :class="[
          'px-4 py-2 font-medium text-sm transition-colors border-b-2',
          selectedTab === tab
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-600 border-transparent hover:text-gray-900',
        ]"
      >
        <span v-if="tab === 'all'">
          Все ({{ driveTestStore.driveTests.length }})
        </span>
        <span v-else-if="tab === 'new'">
          Новые ({{ driveTestStore.newDriveTests.length }})
        </span>
        <span v-else-if="tab === 'confirmed'">
          Подтверждены ({{ driveTestStore.confirmedDriveTests.length }})
        </span>
        <span v-else-if="tab === 'canceled'">
          Отменены ({{ driveTestStore.canceledDriveTests.length }})
        </span>
      </button>
    </div>

    <!-- Таблица заявок -->
    <div v-if="filteredTests.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Статус</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Номер телефона</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Модель</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Дата создания</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Запланирована</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="test in filteredTests"
              :key="test.id"
              :class="['border-b border-gray-100 hover:bg-gray-50 transition-colors', getRowClass(test)]"
            >
              <td class="px-6 py-4">
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusBadgeClass(test.status)]">
                  {{ getStatusText(test.status) }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-sm">{{ test.clientPhone }}</td>
              <td class="px-6 py-4 text-sm">{{ getCarModelName(test) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(test.createdAt) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(test.scheduledAt) }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap items-center gap-2">
                <button
                  @click="openUpdateDialog(test)"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Редактировать
                </button>
                <button
                  @click="removeDriveTest(test.id)"
                  class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div
      v-else
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
    >
      <p class="text-gray-500">Нет заявок для отображения</p>
    </div>

    <!-- Диалог создания -->
    <div
      v-if="showCreateDialog"
      class="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Новая заявка на тест-драйв</h2>
          <button
            @click="showCreateDialog = false; resetNewForm()"
            class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Номер телефона *</label>
            <input
              v-model="newForm.clientPhone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Марка автомобиля *</label>
            <select
              v-model="selectedBrandId"
              @change="onBrandChange"
              class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Выберите марку...</option>
              <option v-for="brand in brandStore.brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Модель автомобиля *</label>
            <select
              v-model="newForm.carModelId"
              :disabled="!selectedBrandId"
              class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Выберите модель...</option>
              <option v-for="model in availableModels" :key="model.id" :value="model.id">
                {{ model.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Дата и время (опционально)</label>
            <input
              v-model="newForm.scheduledAt"
              type="datetime-local"
              class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="showCreateDialog = false; resetNewForm()"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              @click="createDriveTest"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог редактирования -->
    <div
      v-if="showUpdateDialog"
      class="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Редактирование заявки</h2>
          <button
            @click="showUpdateDialog = false"
            class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <select
              v-model="updateForm.status"
              class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="NEW">Новая</option>
              <option value="CONFIRMED">Подтверждена</option>
              <option value="CANCELED">Отменена</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Дата и время</label>
            <input
              v-model="updateForm.scheduledAt"
              type="datetime-local"
              class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <p><strong>Телефон:</strong> {{ editingTest?.clientPhone }}</p>
            <p><strong>Модель:</strong> {{ getCarModelName(editingTest) }}</p>
            <p><strong>Создана:</strong> {{ formatDate(editingTest?.createdAt) }}</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="showUpdateDialog = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              @click="updateDriveTest"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
