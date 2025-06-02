import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Page imports
import LoginPage from './pages/login';
import DashboardHome from "./pages/home";
import BookingsPage from "./pages/bookings";
import CustomersPage from "./pages/customers";
import TravelServicesPage from "./pages/travel services";

// Travel service components
import FlightSearchForm from "./pages/flights";
import HotelSearch from "./pages/hotels";
import FlightBookingForm from "./pages/book flight"; // You'll need to create this
// import TrainSearchForm from "./pages/trains"; // You'll need to create this

// Layout components
import DashboardLayout from "./components/DahboardLayout";
import BusSearchForm from "./pages/bus";
import TrainSearchForm from "./pages/trains";
import PaymentPage from "./pages/payments";
import AdminSettingsPage from "./pages/settings";
import FlightSearchPage from "./pages/airplane";

function App() {
  return (
    <div className="font-montserrat">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
            <Route path="/flight-page" element={<FlightSearchPage />} />
          <Route path="/book/flight" element={<FlightBookingForm />} />


          {/* Dashboard Routes - All protected under the DashboardLayout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Dashboard home */}
            <Route index element={<DashboardHome />} />

            {/* Nested dashboard routes */}
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />


            {/* Travel Services Section */}
            <Route path="travel-services" element={<TravelServicesPage />}>
              <Route index element={<Navigate to="flights" replace />} />
              <Route path="flights" element={<FlightSearchForm />} />
              <Route path="hotels" element={<HotelSearch />} />
              <Route path="buses" element={<BusSearchForm />} />
              <Route path="trains" element={<TrainSearchForm />} />
            </Route>
          </Route>

          {/* Catch all - redirect to login or 404 page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;