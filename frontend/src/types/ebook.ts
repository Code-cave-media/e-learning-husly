export interface Ebook {
  id: number;
  title: string;
  description: string;
  price: number;
  commission: number;
  thumbnail: File | null | string;
  intro_video: File | null | string;
  visible: boolean;
  is_featured: boolean;
  is_new: boolean;
  pdf: File | null | string;
  landing_page: {
    top_heading: string;
    main_heading: string;
    sub_heading: string;
    highlight_words: string;
    thumbnail: File | null | string;
    action_button: string;
  };
  chapters: {
    id: number;
    title: string;
    page_number: number;
  }[];
  created_at: string;
  updated_at: string;
}
