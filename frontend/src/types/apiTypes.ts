export interface IUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  phone: string;
  user_id: string;
}

export interface LandingPage {
  id: number;
  title: string;
  description: string;
  price: number;
  commission: number;
  thumbnail: string;
  intro_video: string;
  is_featured: boolean;
  is_new: boolean;
  is_purchased: boolean;
  landing_page: {
    main_heading: string;
    sub_heading: string;
    top_heading: string;
    thumbnail: string;
    highlight_words: string;
  };
}

export interface EbookLandingResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  commission: number;
  thumbnail: string;
  landing_page: LandingPage;
  intro_video: string;
  is_featured: boolean;
  is_new: boolean;
}

export interface CheckoutResponse {
  item_data: {
    title: string;
    id: number;
    price: number;
    discount: number;
    coupon: string;
    thumbnail: string;
  };
  affiliate_user: {
    id: number;
    name: string;
    user_id: string;
  };
}

export interface AffiliateDashboard {
  overview: {
    total_earnings: number;
    total_clicks: number;
    conversion_rate: number;
    total_active_links: number;
  };
  performance: {
    daily: Array<{
      date: string;
      clicks: number;
      conversions: number;
      earnings: number;
    }>;
  };
  monthlyEarnings: Array<{
    month: string; // format "YYYY-MM"
    earnings: number;
  }>;
  products: Array<{
    id: number;
    name: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  withdrawHistory: Array<{
    id: string;
    date: string; // format "YYYY-MM-DD"
    amount: number;
    status: string; // e.g. "completed"
    method: string; // e.g. "Bank Transfer", "PayPal"
  }>;
  withdrawSummary: {
    totalEarnings: number;
    totalWithdrawn: number;
    pendingWithdraw: number;
  };
}
