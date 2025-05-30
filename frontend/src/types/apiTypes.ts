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
