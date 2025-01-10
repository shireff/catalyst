import { useEffect, useState } from "react";
import { User } from "../types";
import { Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import CustomPaginationComponent from "../components/CustomPaginationComponent";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../store/slices/usersSlice";
import Modal from "../components/ui/Modal";
import EditForm from "../components/EditForm";
import { AddUserFields, editUserFields } from "../data";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
const initializeAddUserData = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  role: "client",
  profile_image: null,
  intro_video: null,
  created_at: "",
  updated_at: "",
};

const initializeEditUserData = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  role: "client",
  profile_image: null,
  intro_video: null,
  created_at: "",
  updated_at: "",
};

const UsersList = () => {
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenRemove, setIsOpenRemove] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const {
    items: users,
    loading,
    error,
  } = useSelector((state: RootState) => state.users);
  const [selectedRole, setSelectedRole] = useState<User["role"] | "all">("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.created_at || "").getTime();
    const dateB = new Date(b.created_at || "").getTime();
    return dateB - dateA;
  });

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageRange, setPageRange] = useState<{ start: number; end: number }>({
    start: 1,
    end: 5,
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const handleDeleteUser = (id: number) => {
    dispatch(deleteUser(id)).then(() => {
      toast.success("User deleted successfully");
      setIsOpenRemove(false);
      dispatch(fetchUsers());
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsOpenEdit(true);
  };

  const handleFileChange = (file: File, fieldName: string) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 10MB limit.");
      return;
    }

    if (fieldName === "profile_image") {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Profile image must be a JPG or PNG file.");
        return;
      }
    }

    if (fieldName === "intro_video") {
      if (file.type !== "video/mp4") {
        toast.error("Intro video must be an MP4 file.");
        return;
      }
    }

    setSelectedFile(file);
  };

  const handleSaveEdit = async (userData: Partial<User>) => {
    try {
      if (!userData.id) {
        throw new Error("User ID is missing.");
      }
      setFormLoading(true);
      const formData = new FormData();

      Object.keys(userData).forEach((key) => {
        const value = userData[key as keyof User];
        if (
          value !== undefined &&
          value !== null &&
          !["profile_image", "intro_video"].includes(key)
        ) {
          formData.append(key, value.toString());
        }
      });

      if (selectedFile) {
        if (selectedFile.type.startsWith("image/")) {
          formData.append("profile_image", selectedFile);
        } else if (selectedFile.type === "video/mp4") {
          formData.append("intro_video", selectedFile);
        }
      }

      const result = await dispatch(
        updateUser({ id: userData.id, data: formData })
      );

      if (updateUser.fulfilled.match(result)) {
        toast.success("User updated successfully");
        setIsOpenEdit(false);
        setSelectedFile(null);
        dispatch(fetchUsers());
      } else {
        const validationErrors = result.payload;
        if (validationErrors) {
          Object.entries(validationErrors).forEach(([, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((message) => toast.error(message));
            }
          });
        } else {
          throw new Error(result.error.message || "Failed to update user.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Network Error")) {
          toast.error("Network error: Please check your internet connection.");
        } else if (error.message.includes("Validation Error")) {
          toast.error(
            "Validation error: Please check the file types. Images must be JPG/PNG and videos must be MP4."
          );
        } else if (error.message.includes("User ID is missing")) {
          toast.error("Error: User ID is required to update the user.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else if (typeof error === "string") {
        toast.error(`Error: ${error}`);
      } else {
        toast.error("Failed to update user. Please try again.");
      }

      console.error("Error updating user:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddUser = async (userData: Partial<User>) => {
    if (!userData.name || !userData.email) {
      toast.error("Name and Email are required.");
      return;
    }
    setFormLoading(true);
    try {
      const formData = new FormData();

      Object.keys(userData).forEach((key) => {
        const value = userData[key as keyof User];
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === "number"
              ? value.toString()
              : (value as string | Blob)
          );
        }
      });

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const result = await dispatch(createUser(formData));

      if (createUser.fulfilled.match(result)) {
        toast.success("User added successfully");
        setIsOpenAdd(false);
        dispatch(fetchUsers());
      } else if (createUser.rejected.match(result)) {
        const validationErrors = result.payload;
        if (validationErrors) {
          Object.entries(validationErrors).forEach(([, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((message) => toast.error(message));
            }
          });
        } else {
          toast.error("Failed to add user. Please try again.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Network Error")) {
          toast.error("Network error: Please check your internet connection.");
        } else if (error.message.includes("Validation Error")) {
          toast.error("Validation error: Please check the input fields.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else if (typeof error === "string") {
        toast.error(`Error: ${error}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Error adding user:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddUserModal = () => {
    setSelectedUser(null);
    setIsOpenAdd(true);
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Users
        </h1>

        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAddUserModal}
            className="px-5 py-2.5 rounded-lg font-medium shadow-md text-white transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 focus:ring-offset-white 
            dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-900"
          >
            + Add User
          </Button>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as User["role"] | "all")
            }
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="client">Clients</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between dark:bg-gray-800"
          >
            <Link
              to={`/user/${user.id}`}
              className="flex items-center space-x-4"
            >
              <img
                src={user.profile_image as string}
                alt={user.name}
                className="w-10 h-10 rounded-full object-inherit border border-gray-300 shadow-md dark:border-gray-600"
              />
              <div>
                <h3 className="font-medium dark:text-gray-200">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full dark:bg-indigo-800 dark:text-indigo-100">
                  {user.role}
                </span>
              </div>
            </Link>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleEditUser(user)}
                className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
              >
                <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <Button
                onClick={() => setIsOpenRemove(true)}
                className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
              >
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
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
                  onClick={() => handleDeleteUser(user.id)}
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
          </div>
        ))}
      </div>

      <CustomPaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        pageRange={pageRange}
      />

      <Modal
        isOpen={isOpenAdd}
        closeModal={() => setIsOpenAdd(false)}
        title="Add New User"
      >
        <EditForm
          fields={AddUserFields}
          onSave={handleAddUser}
          onFileChange={handleFileChange}
          closeModal={() => setIsOpenAdd(false)}
          initializeData={initializeAddUserData}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={isOpenEdit}
        closeModal={() => setIsOpenEdit(false)}
        title="Edit User"
      >
        <EditForm
          fields={editUserFields}
          data={selectedUser}
          onSave={handleSaveEdit}
          onFileChange={handleFileChange}
          closeModal={() => setIsOpenEdit(false)}
          initializeData={initializeEditUserData}
          loading={formLoading}
          submitLabel="Save"
        />
      </Modal>
    </div>
  );
};

export default UsersList;
