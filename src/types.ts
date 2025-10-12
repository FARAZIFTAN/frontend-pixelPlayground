export interface Photo {
  id: string;
  user_id?: string;
  image_data: string;
  frame?: string;
  filter?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export type Page = 'landing' | 'photobooth' | 'editor' | 'gallery' | 'login' | 'register';

export interface Frame {
  id: string;
  name: string;
  image: string;
}

export interface Filter {
  id: string;
  name: string;
  cssFilter: string;
}
