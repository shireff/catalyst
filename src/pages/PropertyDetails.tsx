import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, DollarSign } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import Loading from "../components/Loading";
import { fetchProperty } from "../store/slices/propertiesSlice";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProperty, loading, error } = useSelector(
    (state: RootState) => state.properties
  );

  useEffect(() => {
    if (id) dispatch(fetchProperty(id));
  }, [dispatch, id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    toast.error(error);
    return (
      <div className="text-center text-red-500 dark:text-red-400">{error}</div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="text-center dark:text-gray-300">Property not found</div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {selectedProperty ? ( 
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Image Slider */}
          <div className="lg:h-[500px] rounded-lg overflow-hidden shadow-lg mb-6 lg:mb-0">
            {selectedProperty.images && selectedProperty.images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="h-full w-full"
              >
                {selectedProperty.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={selectedProperty.name || "Property Image"}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  No images available
                </span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 dark:bg-gray-800">
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">
              {selectedProperty.name || "Property Name Not Available"}
            </h1>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              <span>
                {selectedProperty.location ||
                  "Location information not available"}
              </span>
            </div>

            <div className="flex items-center text-indigo-600 text-2xl mb-6 dark:text-indigo-400">
              <DollarSign className="w-6 h-6" />
              <span className="font-semibold">
                {selectedProperty.price
                  ? `$${selectedProperty.price}`
                  : "Price not available"}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-gray-100">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedProperty.description ||
                  "No description available for this property."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Property details not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The details of the selected property could not be loaded. Please try
            again later.
          </p>
        </div>
      )}
    </div>
  );
};
export default PropertyDetails;
