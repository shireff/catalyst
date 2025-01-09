import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Booking, BookingData } from "../../types";
import { bookingsApi } from "../../services/api";

interface BookingsState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async () => {
    try {
      const response = await bookingsApi.getAll();
      const baseUrl = "https://test.catalystegy.com/public/";

      const updatedBookings = response.data.map((booking: Booking) => {
        const images =
          typeof booking.property.images === "string"
            ? JSON.parse(booking.property.images)
            : booking.property.images;

        const fullImages = images.map((image: string) => baseUrl + image);

        return {
          ...booking,
          property: {
            ...booking.property,
            images: fullImages,
          },
        };
      });

      return updatedBookings;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      throw new Error("Failed to fetch bookings");
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData: BookingData) => {
    const response = await bookingsApi.create(bookingData);
    return response.data;
  }
);

export const updateBookingStatus = createAsyncThunk(
  "bookings/updateStatus",
  async ({ id, status }: { id: number; status: Booking["status"] }) => {
    const response = await bookingsApi.updateStatus(id, status);
    return response.data;
  }
);

export const deleteBooking = createAsyncThunk(
  "bookings/deleteBooking",
  async (id: number) => {
    await bookingsApi.remove(id);
    return id;
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (booking) => booking.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (booking) => booking.id !== action.payload
        );
      });
  },
});

export default bookingsSlice.reducer;
