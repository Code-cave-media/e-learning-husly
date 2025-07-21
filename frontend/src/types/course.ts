export interface Course {
  id?: number;
  title: string;
  description: string;
  price: number;
  commission: number;
  thumbnail: File | string | null;
  intro_video: File | string | null;
  visible: boolean;
  is_featured: boolean;
  is_new: boolean;
  landing_page?: {
    top_heading: string;
    main_heading: string;
    sub_heading: string;
    highlight_words: string;
    thumbnail: File | string | null;
    action;
    action_button: string;
  };
  created_at: string | null;
  updated_at: string | null;
  chapters: {
    id?: number;
    title: string;
    description: string;
    duration: number;
    video: File | string | null;
    pdf: File | string | null;
  }[];
}
