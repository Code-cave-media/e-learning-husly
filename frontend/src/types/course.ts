export interface Course {
  id?: number;
  title: string;
  description: string;
  price: number;
  commission: number;
  thumbnail: File | string | null;
  intro_video: File | string | null;
  visible: boolean;
  landing_page?: {
    superHeading: string;
    mainHeading: string;
    subHeading: string;
    highlightWords: string;
    thumbnail: File | string | null;
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
