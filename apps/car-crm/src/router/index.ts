import { createRouter, createWebHistory } from "vue-router";
import { authMiddleware } from "./middleware/auth.middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/LoginView.vue"),
      meta: { guestOnly: true },
    },

    {
      path: "/:branchAlias",
      component: () => import("../layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [],
    },

    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/errors/NotFoundView.vue"),
    },
    {
      path: "/",
      name: "root",
      component: () => import("../views/auth/LoginView.vue"),
    },
  ],
});

router.beforeEach(async (to, from) => {
  const middlewares = [authMiddleware];

  for (const middleware of middlewares) {
    const result = await middleware(to, from);

    if (result !== true) {
      return result;
    }
  }
});
export default router;
