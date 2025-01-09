import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Property } from "../../types";
import { propertiesApi } from "../../services/api";

interface PropertiesState {
  items: Property[];
  selectedProperty: Property | null;
  loading: boolean;
  error: string | null;
}

const initialState: PropertiesState = {
  items: [],
  selectedProperty: null,
  loading: false,
  error: null,
};

export const fetchProperties = createAsyncThunk(
  "properties/fetchProperties",
  async () => {
    try {
      const response = await propertiesApi.getAll();
      const baseUrl = "https://test.catalystegy.com/public/";

      const updatedProperties = Array.isArray(response.data)
        ? response.data.map((property: Property) => {
            const images =
              typeof property.images === "string"
                ? JSON.parse(property.images)
                : property.images || [];

            const fullImages = Array.isArray(images)
              ? images.map((image: string) => baseUrl + image)
              : [];

            return { ...property, images: fullImages };
          })
        : [];

      return updatedProperties;
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      throw new Error("Failed to fetch properties");
    }
  }
);

export const fetchProperty = createAsyncThunk(
  "properties/fetchProperty",
  async (id: string) => {
    try {
      const response = await propertiesApi.getOne(id);
      const baseUrl = "https://test.catalystegy.com/public/";
      const property = response.data;
      if (property.images) {
        const images =
          typeof property.images === "string"
            ? JSON.parse(property.images)
            : property.images;

        const fullImages = images.map((image: string) => baseUrl + image);

        return { ...property, images: fullImages };
      }
      return property;
    } catch (error) {
      console.error("Failed to fetch property:", error);
      throw new Error("Failed to fetch property");
    }
  }
);

export const createProperty = createAsyncThunk(
  "properties/createProperty",
  async (propertyData: FormData) => {
    const response = await propertiesApi.create(propertyData);
    return response.data;
  }
);

export const updateProperty = createAsyncThunk(
  "properties/updateProperty",
  async ({ id, data }: { id: number; data: FormData }) => {
    const response = await propertiesApi.update(id, data);
    return response.data;
  }
);

export const deleteProperty = createAsyncThunk(
  "properties/deleteProperty",
  async (id: number) => {
    await propertiesApi.remove(id);
    return id;
  }
);

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch properties";
      })
      .addCase(fetchProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedProperty = null;
      })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch property";
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (prop) => prop.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.items = state.items.filter((prop) => prop.id !== action.payload);
      });
  },
});

export default propertiesSlice.reducer;
