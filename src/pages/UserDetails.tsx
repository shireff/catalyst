import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchUser } from "../store/slices/usersSlice";
import { AppDispatch, RootState } from "../store";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile_image?: string;
  intro_video?: string;
  created_at: string;
  updated_at: string;
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { user, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchUser(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) return <Loading />;

  if (error) {
    toast.error(error);
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-500">User not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-lg shadow-lg space-y-8">
      <Link
        to="/users"
        className="text-blue-600 hover:text-blue-800 inline-block text-lg font-semibold"
      >
        &larr; Back to Users List
      </Link>

      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8">
        {user.profile_image ? (
          <img
            src={user.profile_image}
            alt={user.name}
            className="w-32 h-32 rounded-full object-inherit border border-gray-300 shadow-md"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-md">
            No Image
          </div>
        )}

        <div className="mt-6 lg:mt-0 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 text-lg mt-2">{user.email}</p>
          {user.phone && <p className="text-gray-600">{user.phone}</p>}
          <span className="inline-block mt-4 text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
            {user.role}
          </span>
        </div>
      </div>

      {user.intro_video ? (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Intro Video
          </h2>
          <video
            controls
            className="w-full max-w-4xl h-auto rounded-lg border border-gray-300 shadow-md"
            src={user.intro_video}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="text-gray-500 text-center lg:text-left">
          No Intro Video Available
        </div>
      )}
    </div>
  );
};

export default UserDetails;
