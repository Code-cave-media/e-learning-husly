export interface Ebook {
  id: number;
  type: string;
  title: string;
  description: string;
  price: number;
  commission: number;
  thumbnail: File | null;
  thumbnailUrl: string;
  introVideo: File | null;
  introVideoUrl: string;
  visible: boolean;
  superHeading: string;
  mainHeading: string;
  subHeading: string;
  highlightWords: string;
  tableOfContents: {
    id: number;
    title: string;
    pageNumber: number;
  }[];
}
