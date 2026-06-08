import { defineStore } from "pinia";

export interface AutoLoanApplication {
  id: string;
  modelId: string;
  carPrice: number;
  downPaymentPercent: number;
  loanTermMonths: number;
  annualInterestRate: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: "pending" | "processing" | "approved" | "rejected";
  createdAt: string;
}

export const useAutoLoanStore = defineStore("autoLoan", {
  state: () => ({
    applications: [] as AutoLoanApplication[],
    isLoading: false,
  }),
  getters: {
    getApplicationById: state => (id: string) => {
      return state.applications.find(app => app.id === id);
    },
  },
  actions: {
    addApplication(application: AutoLoanApplication) {
      this.applications.push(application);
    },
    updateApplication(id: string, updates: Partial<AutoLoanApplication>) {
      const app = this.applications.find(a => a.id === id);
      if (app) {
        Object.assign(app, updates);
      }
    },
  },
});
