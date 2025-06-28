export interface DashboardOverview {
  total_users: number;
  total_courses: number;
  total_ebooks: number;
  total_sales: {
    count: number;
    total_amount: number;
  };
}

export interface MonthlyData {
  month: string;
  sales: number;
}

export interface WithdrawalStats {
  count: number;
  total_amount: number;
}

export interface Withdrawals {
  total_paid_withdrawals: WithdrawalStats;
  total_pending_withdrawals: WithdrawalStats;
  total_withdrawals: WithdrawalStats;
}

export interface DashboardData {
  overview: DashboardOverview;
  line_graph: {
    total_users: MonthlyData[];
  };
  withdrawals: Withdrawals;
}
