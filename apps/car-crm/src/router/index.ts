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
      path: "/",
      name: "main",
      component: () => import("../layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "brands",
          name: "brands",
          component: () => import("../views/brands/BrandsView.vue"),
        },
        {
          path: "models",
          name: "models",
          component: () => import("../views/models/ModelsView.vue"),
        },
        {
          path: "appointments",
          name: "appointments",
          component: () => import("../views/appointments/AppointmentsView.vue"),
        },
      ],
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
