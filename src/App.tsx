import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import Navbar from "./components/Navbar";
import UsersList from "./pages/UsersList";
import PropertiesList from "./pages/PropertiesList";
import PropertyDetails from "./pages/PropertyDetails";
import BookingsList from "./pages/BookingsList";
import UserDetails from "./pages/UserDetails";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<PropertiesList />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/user/:id" element={<UserDetails />} />
              <Route path="/bookings" element={<BookingsList />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
