<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBrandStore } from '@/stores/brand.store';
import { ImageHelper } from '@/utils/image.utils';
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest } from '@car/types';
import { PHOTO_KEYS } from '@car/common';
import { SocketEvent } from '@car/types';
import { socket } from '@/plugins/socket';

import 'primeicons/primeicons.css';

const { t } = useI18n();

const store = useBrandStore();
const newName = ref('');
const editingId = ref<string | null>(null);
const editingName = ref('');
const fileInputs = ref<{ [key: string]: HTMLInputElement }>({});

onMounted(() => {
  store.fetchAll();

  socket.on(SocketEvent.PHOTO_EDIT_RESULT, (data: { success: boolean; targetId: string }) => {
    if (data.success) {
      console.log(t('brands.photoUpdated'));
      store.fetchAll();
    }
  });
});

onUnmounted(() => {
  socket.off(SocketEvent.PHOTO_EDIT_RESULT);
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

function cancelEdit() {
  editingId.value = null;
  editingName.value = '';
}

async function saveEdit() {
  if (!editingId.value) return;
  const dto: UpdateBrandRequest = { brandId: editingId.value, name: editingName.value };
  await store.update(dto);
  editingId.value = null;
  editingName.value = '';
}

async function remove(id: string) {
  if (!confirm(t('brands.delete'))) return;
  await store.remove(id);
}

function getBrandUrl(brand: BrandResponse) {
  return ImageHelper.getPhotoUrl(brand.images, PHOTO_KEYS.PHOTO_MD);
}

async function onFileChange(brandId: string, e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  await store.uploadPhoto(brandId, file, socket.id || '');
  input.value = '';
}

function openFileInput(brandId: string) {
  fileInputs.value[brandId]?.click();
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 antialiased text-gray-800">
    <!-- Заголовок -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{{ t('brands.title') }}</h1>
        <p class="text-sm sm:text-base text-gray-500 mt-1">{{ t('brands.subtitle') }}</p>
      </div>
    </div>

    <!-- Форма добавления -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-8 transition-all hover:shadow-md">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <input 
            v-model="newName" 
            :placeholder="t('brands.placeholder')" 
            class="w-full border border-gray-300 pl-4 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm" 
            @keyup.enter="createBrand"
          />
        </div>
        <button 
          @click="createBrand" 
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap focus:ring-4 focus:ring-blue-100"
        >
          <i class="pi pi-plus text-xs"></i>
          <span>{{ t('brands.add') }}</span>
        </button>
      </div>
    </div>

    <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
      <i class="pi pi-spin pi-spinner text-blue-600 text-3xl mb-3"></i>
      <span class="text-sm font-medium text-gray-500">{{ t('common.loading') }}</span>
    </div>

    <div v-else>
      <div class="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-gray-50/75 border-b border-gray-100">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">{{ t('brands.title') }}</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">{{ t('model.name') }}</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right w-48">{{ t('common.edit') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="b in store.brands" :key="b.id" class="hover:bg-gray-50/50 transition-colors group">
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div 
                    @click="openFileInput(b.id)"
                    class="relative w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden group/thumb shadow-inner cursor-pointer border border-gray-100"
                  >
                    <img 
                      v-if="getBrandUrl(b)" 
                      :src="getBrandUrl(b)!" 
                      class="h-full w-full object-contain p-2 transition-transform duration-300 group-hover/thumb:scale-105" 
                      alt="Logo"
                    />
                    <div v-else class="flex flex-col items-center text-[10px] text-gray-400 font-medium p-1 text-center">
                      <i class="pi pi-image text-lg mb-0.5 text-gray-300"></i>
                      <span>{{ t('common.upload') }}</span>
                    </div>
                    
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                      <i class="pi pi-camera text-base"></i>
                      <span class="text-[10px] font-medium tracking-wide">{{ t('common.edit') }}</span>
                    </div>

                    <input 
                      :ref="el => el && (fileInputs[b.id] = el as HTMLInputElement)" 
                      type="file" 
                      accept="image/*"
                      @change="e => onFileChange(b.id, e)" 
                      class="hidden" 
                    />
                  </div>
                </td>

                <td class="px-6 py-4 vertical-align-middle">
                  <div v-if="editingId === b.id" class="max-w-xs">
                    <input 
                      v-model="editingName" 
                      class="w-full border border-blue-400 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium" 
                      @keyup.enter="saveEdit"
                      @keyup.esc="cancelEdit"
                    />
                  </div>
                  <div v-else class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {{ b.name }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <template v-if="editingId === b.id">
                      <button @click="saveEdit" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" :title="t('configuration.save')">
                        <i class="pi pi-check text-sm font-bold"></i>
                      </button>
                      <button @click="cancelEdit" class="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" :title="t('configuration.cancel')">
                        <i class="pi pi-times text-sm"></i>
                      </button>
                    </template>
                    <template v-else>
                      <button @click="startEdit(b)" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" :title="t('common.edit')">
                        <i class="pi pi-pencil text-sm"></i>
                      </button>
                      <button @click="remove(b.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" :title="t('common.delete')">
                        <i class="pi pi-trash text-sm"></i>
                      </button>
                    </template>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="block md:hidden space-y-3">
        <div 
          v-for="b in store.brands" 
          :key="'mob-' + b.id" 
          class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <div 
              @click="openFileInput(b.id)"
              class="relative w-16 h-16 bg-gray-50 rounded-xl flex shrink-0 items-center justify-center overflow-hidden border border-gray-200 shadow-inner active:scale-95 transition-transform"
            >
              <img 
                v-if="getBrandUrl(b)" 
                :src="getBrandUrl(b)!" 
                class="h-full w-full object-contain p-1.5" 
                alt="Logo"
              />
              <div v-else class="flex flex-col items-center text-[9px] text-gray-400 font-medium text-center p-0.5">
                <i class="pi pi-image text-base text-gray-300"></i>
                <span>{{ t('common.upload') }}</span>
              </div>
              
              <div class="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 flex items-center justify-center text-white gap-1">
                <i class="pi pi-camera text-[10px]"></i>
                <span class="text-[9px] font-medium tracking-tight">{{ t('common.edit') }}</span>
              </div>

              <input 
                :ref="el => el && (fileInputs[b.id] = el as HTMLInputElement)" 
                type="file" 
                accept="image/*"
                @change="e => onFileChange(b.id, e)" 
                class="hidden" 
              />
            </div>

            <div class="flex-1 min-w-0">
              <div v-if="editingId === b.id" class="w-full">
                <input 
                  v-model="editingName" 
                  class="w-full border border-blue-400 px-2 py-1.5 rounded-lg focus:outline-none text-sm font-medium" 
                  @keyup.enter="saveEdit"
                  @keyup.esc="cancelEdit"
                />
              </div>
              <div v-else class="text-base font-semibold text-gray-950 truncate">
                {{ b.name }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <template v-if="editingId === b.id">
              <button @click="saveEdit" class="w-9 h-9 flex items-center justify-center text-emerald-600 bg-emerald-50 active:bg-emerald-100 rounded-lg transition-colors">
                <i class="pi pi-check text-sm font-bold"></i>
              </button>
              <button @click="cancelEdit" class="w-9 h-9 flex items-center justify-center text-gray-400 bg-gray-50 active:bg-gray-100 rounded-lg transition-colors">
                <i class="pi pi-times text-sm"></i>
              </button>
            </template>
            <template v-else>
              <button @click="startEdit(b)" class="w-9 h-9 flex items-center justify-center text-gray-500 bg-gray-50 active:bg-blue-50 active:text-blue-600 rounded-lg transition-colors">
                <i class="pi pi-pencil text-sm"></i>
              </button>
              <button @click="remove(b.id)" class="w-9 h-9 flex items-center justify-center text-gray-400 bg-gray-50 active:bg-red-50 active:text-red-600 rounded-lg transition-colors">
                <i class="pi pi-trash text-sm"></i>
              </button>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!store.brands?.length" class="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
        <i class="pi pi-folder-open text-3xl mb-2 block text-gray-300"></i>
        {{ t('brands.subtitle') }}
      </div>
    </div>
  </section>
</template>