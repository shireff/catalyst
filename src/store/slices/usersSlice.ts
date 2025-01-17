import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "../../services/api";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string | null;
  role: string;
  intro_video?: string | null;
  created_at?: string;
}

interface UsersState {
  items: User[];
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  user: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  try {
    const baseUrl = "https://test.catalystegy.com/public/";

    const response = await usersApi.getAll();

    const updatedUsers = Array.isArray(response.data)
      ? response.data.map((user) => {
          let { profile_image } = user;

          if (
            profile_image &&
            typeof profile_image === "string" &&
            !profile_image.startsWith("http://") &&
            !profile_image.startsWith("https://")
          ) {
            profile_image = baseUrl + profile_image;
          }

          return { ...user, profile_image };
        })
      : [];

    return updatedUsers;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
});

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id: number) => {
    try {
      const response = await usersApi.getOne(id);
      const baseUrl = "https://test.catalystegy.com/public/";

      const user = response.data;

      let profileImage = user.profile_image;

      if (
        profileImage &&
        typeof profileImage === "string" &&
        !profileImage.startsWith("http://") &&
        !profileImage.startsWith("https://")
      ) {
        profileImage = baseUrl + profileImage;
      }

      return { ...user, profile_image: profileImage };
    } catch (error) {
      console.error("Failed to fetch user:", error);
      throw new Error("Failed to fetch user");
    }
  }
);

export const createUser = createAsyncThunk<User, FormData>(
  "users/createUser",
  async (userData: FormData, { rejectWithValue }) => {
    try {
      const response = await usersApi.create(userData);
      return response.data as User;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const validationErrors = error.response.data?.messages || {};
        return rejectWithValue(validationErrors);
      }
      return rejectWithValue({ error: "An unknown error occurred." });
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }: { id: number; data: FormData }) => {
    const response = await usersApi.update(id, data);
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number) => {
    await usersApi.remove(id);
    return id;
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((user) => user.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
