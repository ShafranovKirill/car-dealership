<script setup lang="ts">

</script>
<template>
  <AppHeader />
  <main class="max-w-420 pt-16 mx-auto px-4 sm:px-6 lg:px-8 w-full">
    <router-view />
  </main>
  <AppFooter />

  <OrderDialog />
</template>
