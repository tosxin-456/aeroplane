import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Page imports
import LoginPage from './pages/login';
import DashboardHome from "./pages/home";
import BookingsPage from "./pages/bookings";
import CustomersPage from "./pages/customers";
import TravelServicesPage from "./pages/travel services";
import FlightSearchForm from "./pages/flights";
import HotelSearch from "./pages/hotels";
import FlightBookingForm from "./pages/book flight";
import TrainSearchForm from "./pages/trains";
import BusSearchForm from "./pages/bus";
import PaymentPage from "./pages/payments";
import AdminSettingsPage from "./pages/settings";
import FlightSearchPage from "./pages/airplane";

// Layouts
import DashboardLayout from "./components/DahboardLayout";
import FloatingNavbar from "./components/navbar";
import FlightBookingsDisplay from "./pages/manualbookinsg";
import Register from "./pages/sign up";
import Login from "./pages/login user";
// import PublicLayout from "./components/publicLayout";


function App() {
  return (
    <div className="font-montserrat">
      <Router>
        <Routes>
          {/* Public routes (with FloatingNavbar via PublicLayout) */}
          <Route path="/" element={<FloatingNavbar />}>
            <Route index element={<FlightSearchPage />} />
            <Route path="book/flight" element={<FlightBookingForm />} />
            <Route path="hotels" element={<HotelSearch />} />
            <Route path="trains" element={<TrainSearchForm />} />
            <Route path="buses" element={<BusSearchForm />} />
          </Route>

          {/* Admin login route (no layout) */}
          <Route path="/admin" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard routes (with DashboardLayout) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="manual-book" element={<FlightBookingsDisplay />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />

            {/* Nested inside travel-services */}
            <Route path="travel-services" element={<TravelServicesPage />}>
              <Route index element={<Navigate to="flights" replace />} />
              <Route path="flights" element={<FlightSearchForm />} />
              <Route path="hotels" element={<HotelSearch />} />
              <Route path="buses" element={<BusSearchForm />} />
              <Route path="trains" element={<TrainSearchForm />} />
            </Route>
          </Route>

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
