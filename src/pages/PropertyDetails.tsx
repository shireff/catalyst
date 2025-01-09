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
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!selectedProperty) {
    return <div className="text-center">Property not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="lg:h-[500px] rounded-lg overflow-hidden shadow-lg mb-6 lg:mb-0">
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
                  alt={selectedProperty.name}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-800">
            {selectedProperty.name}
          </h1>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
            <span>{selectedProperty.location}</span>
          </div>

          <div className="flex items-center text-indigo-600 text-2xl mb-6">
            <DollarSign className="w-6 h-6" />
            <span className="font-semibold">{selectedProperty.price}</span>
            <span className="text-gray-600 ml-1">/night</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Description
            </h2>
            <p className="text-gray-600">{selectedProperty.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PropertyDetails;
