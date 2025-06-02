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
    total_earnings: { value: number; hike: number };
    total_clicks: { value: number; hike: number };
    conversion_rate: { value: number; hike: number };
    total_active_links: number;
  };
  performance: Array<{
    date: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  monthly_earnings: Array<{
    month: string; // format "YYYY-MM"
    earnings: number;
  }>;
  products: {
    has_next: boolean;
    has_prev: boolean;
    total: number;
    total_pages: number;
    items: Array<{
      id: number;
      name: string;
      clicks: number;
      conversions: number;
      earnings: number;
      item_id: number;
      item_type: string;
    }>;
  };
  withdraw_history: {
    has_next: boolean;
    has_prev: boolean;
    total: number;
    total_pages: number;
    items: Array<{
      id: number;
      amount: number;
      created_at: string;
      status: string;
      explanation: string | null;
      account_details: string;
    }>;
  };
  withdraw_summary: {
    balance: number;
    total_withdrawn: number;
    pending_withdraw: number;
  };
  withdraw_account_details?: {
    upi_details: { upiId: string };
    bank_details: {
      bank_name: string;
      account_number: string;
      ifsc_code: string;
      account_name: string;
    };
  };
}
