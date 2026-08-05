export type AdminTabType =
  | "overview"
  | "bookings"
  | "contact"
  | "services"
  | "menu"
  | "testimonials"
  | "gallery";

export interface EventBooking {
  id: string;
  userDetails?: {
    name?: string;
    phone?: string;
    notes?: string;
  };
  eventDetails?: {
    eventType?: string;
    guestCount?: number;
    eventDate?: string | any;
    mealType?: string;
  };
  selectedMenu?: Array<{
    id: string | number;
    name: string;
    price: number;
    category: string;
    rawPrice?: string;
  }>;
  perGuestTotal?: number;
  cartTotal?: number;
  status?: string;
  createdAt?: any;
}

export interface GlobalSettings {
  phoneNumber: string;
  secondaryPhone?: string;
  whatsappNumber: string;
  officialEmail?: string;
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
  isPinned?: boolean;
  createdAt?: any;
}

export interface MenuItem {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  subCourse?: string;
  price: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  suitableMeals?: string[];
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
