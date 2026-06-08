export interface AutoLoanApplicationRequest {
  modelId: string;
  carPrice: number;
  downPaymentPercent: number;
  loanTermMonths: number;
  annualInterestRate: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface AutoLoanApplicationResponse {
  id: string;
  status: string;
  createdAt: string;
}
