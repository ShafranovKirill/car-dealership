import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "main",
      component: () => import("../layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      redirect: { name: "models" },
      children: [
        {
          path: "models",
          name: "models",
          component: () => import("../views/models/ModelsView.vue"),
        },
        {
          path: "models/:modelId",
          name: "model-detail",
          component: () => import("../views/models/ModelDetailView.vue"),
        },
        {
          path: "test-drive",
          name: "test-drive",
          component: () => import("../views/TestDriveView.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/errors/NotFoundView.vue"),
    },
  ],
});

export default router;
