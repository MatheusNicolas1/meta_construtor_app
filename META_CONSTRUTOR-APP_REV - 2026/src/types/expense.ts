export type CostCategory = 'Material' | 'Mão de Obra' | 'Equipamento' | 'Frete' | 'Serviços' | 'Outros';

export type ApprovalStatus = 'Pending Manager' | 'Pending General Manager' | 'Approved' | 'Rejected';

export interface Expense {
  id: string;
  user_submitting_id: string;
  obra_id: string;
  cost_category: CostCategory;
  invoice_number: string;
  supplier_name: string;
  amount: number;
  date_of_expense: string;
  invoice_file_url?: string;
  component_id?: string;
  team_member_id?: string;
  approval_status: ApprovalStatus;
  manager_approver_id?: string;
  manager_approved_at?: string;
  general_manager_approver_id?: string;
  general_manager_approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  obra_id: string;
  cost_category: CostCategory;
  invoice_number: string;
  supplier_name: string;
  amount: number;
  date_of_expense: string;
  invoice_file_url?: string;
  component_id?: string;
  team_member_id?: string;
  notes?: string;
}

export interface ApproveExpenseData {
  id: string;
  approval_status: 'Pending General Manager' | 'Approved' | 'Rejected';
  rejection_reason?: string;
}
