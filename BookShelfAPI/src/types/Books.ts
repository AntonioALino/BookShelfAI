export interface VolumeInfo {
  title: string;
  authors: string[];
  description: string;
  pageCount: number;
  imageLinks?: {
    thumbnail: string;
    smallThumbnail: string;
  };
}

export interface Book {
  id: string;
  volumeInfo: VolumeInfo;
}

export interface GoogleBooksApiResponse {
  items: Book[];
  totalItems: number;
}