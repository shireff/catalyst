export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string | null;
  intro_video?: string | null;
}

export interface UserPayload {
  name: string;
  email: string;
  role: string;
  profile_image?: File | string | null;
  intro_video?: File | string | null;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_image?: File;
  intro_video?: File;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | File | undefined;
}

export interface Property {
  id: number;
  user_id?: number;
  name: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  video?: File;
}

export interface Booking {
  id: number;
  property: {
    id: string;
    name: string;
    description: string;
    price: string;
    location: string;
    images: string[];
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_image?: string;
  };
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  totalPrice: number;
  createdAt: string;
}

export interface BookingData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  profile_image?: string | null;
  intro_video?: string | null;
  user_id: number;
  property_id: number;
  property_name: string;
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
}
