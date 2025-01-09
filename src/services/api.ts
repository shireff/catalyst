import axios, { AxiosInstance } from "axios";
import { User, Property, Booking, BookingData } from "../types";

class ApiService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({ baseURL });
  }

  protected get<T>(url: string) {
    return this.api.get<T>(url);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected post<T>(url: string, data: any) {
    return this.api.post<T>(url, data);
  }

  protected delete(url: string) {
    return this.api.delete(url);
  }
}

class UsersService extends ApiService {
  getAll() {
    return this.get<User[]>("/users");
  }

  create(data: FormData) {
    return this.post("/users", data);
  }

  getOne(id: number) {
    return this.get<User>(`/users/${id}`);
  }

  update(id: number, data: FormData) {
    return this.post<User>(`/users/${id}`, data);
  }

  remove(id: number) {
    return this.delete(`/users/${id}`);
  }
}

class PropertiesService extends ApiService {
  getAll() {
    return this.get<Property[]>("/properties");
  }

  create(data: FormData) {
    return this.post<Property>("/properties", data);
  }

  getOne(id: string) {
    return this.get<Property>(`/properties/${id}`);
  }

  update(id: number, data: FormData) {
    return this.post<Property>(`/properties/${id}`, data);
  }

  remove(id: number) {
    return this.delete(`/properties/${id}`);
  }
}

class BookingsService extends ApiService {
  getAll() {
    return this.get<Booking[]>("/bookings");
  }

  create(data: BookingData) {
    return this.post<Booking>("/bookings", data);
  }

  updateStatus(id: number, status: Booking["status"]) {
    return this.post<Booking>(`/bookings/${id}/status`, { status });
  }

  remove(id: number) {
    return this.delete(`/bookings/${id}`);
  }
}

const baseURL = "https://test.catalystegy.com/api";
export const usersApi = new UsersService(baseURL);
export const propertiesApi = new PropertiesService(baseURL);
export const bookingsApi = new BookingsService(baseURL);
