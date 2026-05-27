<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBrandStore } from '@/stores/brand.store';
import { ImageHelper } from '@/utils/image.utils';
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest } from '@car/types';
import { PHOTO_KEYS } from '@car/common';

const store = useBrandStore();
const newName = ref('');
const editingId = ref<string | null>(null);
const editingName = ref('');
const fileInputs = ref<{ [key: string]: HTMLInputElement }>({});

onMounted(() => {
  store.fetchAll();
});

async function createBrand() {
  if (!newName.value.trim()) return;
  const dto: CreateBrandRequest = { name: newName.value.trim() };
  await store.create(dto);
  newName.value = '';
}

function startEdit(b: any) {
  editingId.value = b.id;
  editingName.value = b.name;
}

async function saveEdit() {
  if (!editingId.value) return;
  const dto: UpdateBrandRequest = { brandId: editingId.value, name: editingName.value };
  await store.update(dto);
  editingId.value = null;
  editingName.value = '';
}

async function remove(id: string) {
  if (!confirm('Удалить производителя?')) return;
  await store.remove(id);
}

function getBrandUrl(brand: BrandResponse) {
  return (
    ImageHelper.getPhotoUrl(brand.images, PHOTO_KEYS.PHOTO_MD)
  );
}

async function onFileChange(brandId: string, e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  await store.uploadPhoto(brandId, file);
  input.value = '';
}

function openFileInput(brandId: string) {
  fileInputs.value[brandId]?.click();
}
</script>

<template>
  <section class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Производители</h1>
      <p class="text-gray-500">Управление брендами и их логотипами</p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex gap-3">
        <input v-model="newName" placeholder="Название новой марки" class="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button @click="createBrand" class="btn btn-primary">Добавить</button>
      </div>
    </div>

    <div v-if="store.isLoading" class="text-center py-8 text-gray-500">Загрузка...</div>

    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Логотип</th>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Название</th>
            <th class="text-left px-6 py-4 font-semibold text-gray-700">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="b in store.brands" :key="b.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex flex-col gap-3">
                <div class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img v-if="getBrandUrl(b)" :src="getBrandUrl(b)!" class="h-full w-full object-contain p-2" />
                  <div v-else class="text-sm text-gray-400">Нет логотипа</div>
                </div>
                <button v-if="editingId === b.id" @click="openFileInput(b.id)" class="px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200">
                  📷 Сменить фото
                </button>
                <input :ref="el => el && (fileInputs[b.id] = el as HTMLInputElement)" type="file" @change="e => onFileChange(b.id, e)" class="hidden" />
              </div>
            </td>
            <td class="px-6 py-4">
              <div v-if="editingId === b.id">
                <input v-model="editingName" class="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div v-else class="text-gray-800 font-medium">{{ b.name }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button v-if="editingId !== b.id" @click="startEdit(b)" class="btn btn-secondary">Изменить</button>
                <button v-if="editingId === b.id" @click="saveEdit" class="btn btn-success">Сохранить</button>
                <button @click="remove(b.id)" class="btn btn-danger">Удалить</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2b6cb0 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
</style>
