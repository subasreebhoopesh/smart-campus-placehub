import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Companies from "./pages/admin/Companies";
import Drives from "./pages/admin/Drives";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import Opportunities from "./pages/student/Opportunities";
import Applications from "./pages/student/Applications";
import Profile from "./pages/student/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/companies" element={<Companies />} />
          <Route path="/admin/drives" element={<Drives />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/opportunities" element={<Opportunities />} />
          <Route path="/student/applications" element={<Applications />} />
          <Route path="/student/profile" element={<Profile />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
