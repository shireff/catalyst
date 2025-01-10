import { useEffect, useState } from "react";
import { Booking, BookingData } from "../types";
import { Calendar, Clock, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import Loading from "@/components/Loading";
import {
  createBooking,
  deleteBooking,
  fetchBookings,
  updateBookingStatus,
} from "@/store/slices/bookingsSlice";
import CustomPaginationComponent from "@/components/CustomPaginationComponent";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EditForm from "@/components/EditForm";
import { AddBookingFields } from "@/data";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const initializeAddBookingData: BookingData = {
  id: Math.floor(Math.random() * 1000),
  name: "",
  email: "",
  phone: "",
  role: "client",
  profile_image: null,
  intro_video: null,
  user_id: Math.floor(Math.random() * 1000),
  property_id: Math.floor(Math.random() * 1000),
  property_name: "",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  status: "pending",
};

export default function BookingsList() {
  const [isOpenRemove, setIsOpenRemove] = useState(false);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const {
    items: bookings,
    loading,
    error,
  } = useSelector((state: RootState) => state.bookings);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageRange, setPageRange] = useState<{ start: number; end: number }>({
    start: 1,
    end: 5,
  });

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const currentBooking = [...bookings].slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);

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
  const handleDeleteBooking = async (id: number) => {
    try {
      setFormLoading(true);
      const result = await dispatch(deleteBooking(id));

      if (deleteBooking.fulfilled.match(result)) {
        toast.success("Booking deleted successfully");
        setIsOpenRemove(false);
        dispatch(fetchBookings());
      } else if (deleteBooking.rejected.match(result)) {
        const errorMessage =
          result.error?.message ||
          "Failed to delete booking. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(
          "An unknown error occurred while deleting the booking. Please try again."
        );
      }

      console.error("Delete booking error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmBooking = async (id: number) => {
    try {
      setFormLoading(true);
      setIsOpenConfirm(false);

      const result = await dispatch(
        updateBookingStatus({ id, status: "confirmed" })
      );

      if (updateBookingStatus.fulfilled.match(result)) {
        toast.success("Booking confirmed successfully");
        dispatch(fetchBookings());
      } else if (updateBookingStatus.rejected.match(result)) {
        const errorMessage =
          result.error?.message ||
          "Failed to confirm booking. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(
          "An unknown error occurred while confirming the booking. Please try again."
        );
      }

      console.error("Confirm booking error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddBooking = async (userData: Partial<BookingData>) => {
    const payload: BookingData = {
      id: userData.id || 0,
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || null,
      role: userData.role || "",
      profile_image: userData.profile_image || null,
      intro_video: userData.intro_video || null,
      user_id: userData.user_id || Math.floor(Math.random() * 1000),
      property_id: userData.property_id || Math.floor(Math.random() * 1000),
      property_name: userData.property_name || "Unknown Property",
      start_date: userData.start_date || new Date().toISOString().split("T")[0],
      end_date: userData.end_date || "",
      status: userData.status || "pending",
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.start_date ||
      !payload.end_date
    ) {
      toast.error("Missing required fields. Please fill all required fields.");
      return;
    }

    try {
      setFormLoading(true);
      const result = await dispatch(createBooking(payload));

      if (createBooking.fulfilled.match(result)) {
        toast.success("Booking added successfully");
        setIsOpenAdd(false);
        dispatch(fetchBookings());
      } else {
        const errorMessage =
          result.error?.message || "Failed to add booking. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error adding booking:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error adding booking:", error);
        toast.error("An unknown error occurred. Please try again.");
      }
    } finally {
      setFormLoading(false);
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Bookings
        </h1>
        <Button
          onClick={() => setIsOpenAdd(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Add New
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                User Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Property Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          {currentBooking.map((booking: Booking) => (
            <>
              <tbody>
                <tr
                  key={booking.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {booking.id}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    <div className="flex items-center space-x-4">
                      <img
                        src={booking.user.profile_image}
                        alt={booking.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />
                      <div>
                        <p className="font-medium">{booking.user.name}</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          {booking.user.email}
                        </p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          {booking.user.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    <p className="font-medium">{booking.property.name}</p>
                    <p className="text-gray-500 text-sm line-clamp-2 dark:text-gray-400">
                      {booking.property.description}
                    </p>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                      {booking.property.location}
                    </p>
                    <p className="text-indigo-600 font-semibold mt-1 dark:text-indigo-400">
                      ${booking.property.price} / night
                    </p>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <p>{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <p>{new Date(booking.end_date).toLocaleDateString()}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        statusColors[booking.status] ||
                        "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setIsOpenRemove(true)}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                      {booking.status === "pending" && (
                        <>
                          <Button
                            onClick={() => setIsOpenConfirm(true)}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
              <Modal
                isOpen={isOpenConfirm}
                closeModal={() => setIsOpenConfirm(false)}
                title="Are you sure you want to Confirm this Booking?"
                description="Are you sure you want to confirm this booking? Please note that this action is final and cannot be undone. Ensure all details are accurate before proceeding"
              >
                <div className="flex items-center space-x-3 ">
                  <Button
                    onClick={() => handleConfirmBooking(booking.id)}
                    className="bg-green-600 w-full text-white font-bold text-[20px] p-3 rounded-[10px]"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setIsOpenConfirm(false)}
                    className="bg-gray-200 w-full text-white font-bold text-[20px] p-3 rounded-[10px] dark:bg-gray-600 dark:text-gray-300"
                  >
                    No
                  </Button>
                </div>
              </Modal>
              <Modal
                isOpen={isOpenRemove}
                closeModal={() => setIsOpenRemove(false)}
                title="Are you sure you want to remove this Booking?"
                description="Are you sure you want to remove this booking? This action is irreversible, and all associated data will be permanently deleted."
              >
                <div className="flex items-center space-x-3 ">
                  <Button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="bg-red-600 w-full text-white font-bold text-[20px] p-3 rounded-[10px]"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setIsOpenRemove(false)}
                    className="bg-gray-200 w-full text-white font-bold text-[20px] p-3 rounded-[10px] dark:bg-gray-600 dark:text-gray-300"
                  >
                    No
                  </Button>
                </div>
              </Modal>
            </>
          ))}
        </table>
      </div>

      {!loading && bookings.length > itemsPerPage && (
        <CustomPaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          pageRange={pageRange}
          handlePageChange={handlePageChange}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
        />
      )}

      <Modal
        isOpen={isOpenAdd}
        closeModal={() => setIsOpenAdd(false)}
        title="Add New Booking"
      >
        <EditForm
          fields={AddBookingFields}
          onSave={handleAddBooking}
          closeModal={() => setIsOpenAdd(false)}
          initializeData={initializeAddBookingData}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}
