import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Property } from "../types";
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  updateProperty,
} from "../store/slices/propertiesSlice";
import { MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import toast from "react-hot-toast";
import CustomPaginationComponent from "../components/CustomPaginationComponent";
import Loading from "../components/Loading";
import { AppDispatch, RootState } from "../store";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EditForm from "@/components/EditForm";
import { AddPropertyFields, PropertyFields } from "@/data";
const initializePropertyData: Property = {
  id: 0,
  name: "",
  description: "",
  location: "",
  price: 0,
  images: [],
};

const initializeAddPropertyData = {
  id: 0,
  name: "",
  description: "",
  location: "",
  price: 0,
  images: [],
};
const PropertiesList = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenRemove, setIsOpenRemove] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpenAdd, setIsOpenAdd] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedProperty(null);
  };
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: properties,
    loading,
    error,
  } = useSelector((state: RootState) => state.properties);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageRange, setPageRange] = useState<{ start: number; end: number }>({
    start: 1,
    end: 5,
  });

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const currentProperties = [...properties]
    .sort((a, b) => b.id - a.id)
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const handleNext = () => {
    if (pageRange.end < totalPages) {
      setPageRange({
        start: pageRange.start + 5,
        end: Math.min(pageRange.end + 5, totalPages),
      });
    }
  };

  const handlePrevious = () => {
    if (pageRange.start > 1) {
      setPageRange({
        start: pageRange.start - 5,
        end: pageRange.end - 5,
      });
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsEditing(true);
  };

  const handleFileChange = (file: File, fieldName: string) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 10MB limit.");
      return;
    }

    if (
      fieldName === "profile_image" &&
      !["image/jpeg", "image/png"].includes(file.type)
    ) {
      toast.error("Profile image must be a JPG or PNG file.");
      return;
    }

    if (fieldName === "intro_video" && file.type !== "video/mp4") {
      toast.error("Intro video must be an MP4 file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSaveEdit = async (propertyData: Partial<Property>) => {
    try {
      if (!selectedProperty) {
        throw new Error("No property selected for editing.");
      }

      const formData = new FormData();

      Object.keys(propertyData).forEach((key) => {
        const value = propertyData[key as keyof Property];
        if (
          value !== undefined &&
          value !== null &&
          key !== "images" &&
          key !== "video"
        ) {
          formData.append(key, value as string | Blob);
        }
      });

      if (Array.isArray(propertyData.images)) {
        propertyData.images.forEach((image: File | string, index) => {
          if (image instanceof File) {
            formData.append(`images[${index}]`, image);
          }
        });
      }

      if (selectedFile) {
        formData.append("images[]", selectedFile);
      }

      if (propertyData.video && propertyData.video instanceof File) {
        formData.append("video", propertyData.video);
      }

      const result = await dispatch(
        updateProperty({ id: selectedProperty.id, data: formData })
      );

      if (updateProperty.fulfilled.match(result)) {
        toast.success("Property updated successfully!");
        dispatch(fetchProperties());
        closeEditModal();
      } else {
        throw new Error(result.error.message || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property. Please try again.");
    }
  };

  const handleDeleteProperty = async (id: number) => {
    try {
      const result = await dispatch(deleteProperty(id));

      if (deleteProperty.fulfilled.match(result)) {
        toast.success("Property deleted successfully");
        setIsOpenRemove(false);
        dispatch(fetchProperties());
      } else {
        const errorMessage =
          result.error?.message ||
          "Failed to delete property. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred. Please try again."
      );
    }
  };

  const handleAddPropertyModal = () => {
    setSelectedFile(null);
    setIsOpenAdd(true);
  };

  const handleAddProperty = async (propertyData: Partial<Property>) => {
    try {
      const formData = new FormData();

      Object.keys(propertyData).forEach((key) => {
        const value = propertyData[key as keyof Property];
        if (value !== undefined && value !== null) {
          if (key === "images" && Array.isArray(value)) {
            value.forEach((image: File | string, index) => {
              if (image instanceof File) {
                formData.append(`images[${index}]`, image);
              }
            });
          } else if (key === "video" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      });

      if (selectedFile) {
        formData.append("images[]", selectedFile);
      }

      if (!propertyData.user_id) {
        formData.append("user_id", Math.floor(Math.random() * 1000).toString());
      }

      const result = await dispatch(createProperty(formData));

      if (createProperty.fulfilled.match(result)) {
        toast.success("Property added successfully!");
        setIsOpenAdd(false);
        dispatch(fetchProperties());
      } else {
        throw new Error(result.error.message || "Failed to add property.");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property. Please try again.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    toast.error(error);
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Featured Properties</h1>
        <Button
          onClick={handleAddPropertyModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProperties.map((property: Property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link to={`/properties/${property.id}`}>
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="h-48"
              >
                {property.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                <div className="flex items-center text-indigo-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">{property.price}</span>
                </div>
              </div>
            </Link>
            <div className="p-4 flex justify-between">
              <Button
                onClick={() => handleEdit(property)}
                className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => setIsOpenRemove(true)}
                className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
            <Modal
              isOpen={isOpenRemove}
              closeModal={() => setIsOpenRemove(false)}
              title="Are you sure you want to remove this User?"
              description="Deleting this user will permanently remove it from your company, and any data associated with it will be deleted, please make sure you want to do this?"
            >
              <div className="flex items-center space-x-3 ">
                <Button
                  onClick={() => handleDeleteProperty(property.id)}
                  className="bg-red-600 w-full text-white font-bold text-[20px] p-3 rounded-[10px]"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setIsOpenRemove(false)}
                  className="bg-gray-200 w-full text-white font-bold text-[20px] p-3 rounded-[10px]"
                >
                  No
                </Button>
              </div>
            </Modal>
          </div>
        ))}
      </div>

      {!loading && properties.length > itemsPerPage && (
        <CustomPaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          pageRange={pageRange}
          handlePageChange={handlePageChange}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
        />
      )}

      {isEditing && selectedProperty && (
        <Modal
          isOpen={isEditing}
          closeModal={closeEditModal}
          title={`Edit Property: ${selectedProperty.name}`}
        >
          <EditForm
            fields={PropertyFields}
            data={selectedProperty}
            onSave={handleSaveEdit}
            onFileChange={handleFileChange}
            closeModal={closeEditModal}
            initializeData={initializePropertyData}
          />
        </Modal>
      )}

      <Modal
        isOpen={isOpenAdd}
        closeModal={() => setIsOpenAdd(false)}
        title="Add New User"
      >
        <EditForm
          fields={AddPropertyFields}
          onSave={handleAddProperty}
          onFileChange={handleFileChange}
          closeModal={() => setIsOpenAdd(false)}
          initializeData={initializeAddPropertyData}
        />
      </Modal>
    </div>
  );
};

export default PropertiesList;
