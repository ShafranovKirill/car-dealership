import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

export async function authMiddleware(to: RouteLocationNormalized, _from: RouteLocationNormalized) {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.init();
  }

  const isLoggedIn = authStore.isLoggedIn;
  const { requiresAuth, guestOnly } = to.meta;

  if (requiresAuth && !isLoggedIn) {
    return { name: "login" };
  }

  if (guestOnly && isLoggedIn) {
    return {
      name: "main",
    };
  }

  return true;
}
