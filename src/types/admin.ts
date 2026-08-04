export type AdminTabType =
  | "overview"
  | "contact"
  | "services"
  | "menu"
  | "testimonials"
  | "gallery";

export interface GlobalSettings {
  phoneNumber: string;
  whatsappNumber: string;
  instagramUrl: string;
  googleMapsUrl: string;
  address?: string;
  updatedAt?: any;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  emoji?: string;
  icon?: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt?: any;
}

export interface MenuItem {
  id: string;
  title: string;
  category: string;
  price: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt?: any;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: any;
}

export interface Review {
  id: string;
  name: string;
  role?: string;
  eventType?: string;
  rating?: number;
  content?: string;
  review?: string;
  status?: string;
  createdAt?: any;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  tag: string;
  eventTag?: string;
  category?: string;
  isVideo?: boolean;
  type?: string;
  resource_type?: string;
  imageUrl: string;
  secure_url?: string;
  imagePublicId: string;
  public_id?: string;
  createdAt?: any;
}

export interface ToastMessage {
  type: "success" | "error" | "info";
  message: string;
}
