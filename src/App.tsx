import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CompaniesProvider } from "@/contexts/CompaniesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import HRLogin from "./pages/HRLogin";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Companies from "./pages/admin/Companies";
import Drives from "./pages/admin/Drives";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import HRCredentials from "./pages/admin/HRCredentials";
import AdminApplications from "./pages/admin/Applications";
import AdminProfile from "./pages/admin/Profile";
import AdminChat from "./pages/admin/Chat";
import DocumentVerification from "./pages/admin/DocumentVerification";
import OfferLetters from "./pages/admin/OfferLetters";
import Assessments from "./pages/admin/Assessments";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import Opportunities from "./pages/student/Opportunities";
import Applications from "./pages/student/Applications";
import Profile from "./pages/student/Profile";
import Resources from "./pages/student/Resources";
import StudentChat from "./pages/student/Chat";
import ResumeBuilder from "./pages/student/ResumeBuilder";
import StudentDocuments from "./pages/student/Documents";
import StudentAssessment from "./pages/student/Assessment";
import MyAssessments from "./pages/student/MyAssessments";
import AICareerBot from "./pages/student/AICareerBot";

// HR Pages
import HRDashboard from "./pages/hr/Dashboard";
import HRApplications from "./pages/hr/Applications";
import HRSkills from "./pages/hr/Skills";
import HRProfile from "./pages/hr/Profile";
import HROfferLetters from "./pages/hr/OfferLetters";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <CompaniesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/hr/login" element={<HRLogin />} />
          <Route path="/hr-login" element={<HRLogin />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/companies" element={<Companies />} />
          <Route path="/admin/drives" element={<Drives />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/hr-credentials" element={<HRCredentials />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/documents" element={<DocumentVerification />} />
          <Route path="/admin/offer-letters" element={<OfferLetters />} />
          <Route path="/admin/assessments" element={<Assessments />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/opportunities" element={<Opportunities />} />
          <Route path="/student/applications" element={<Applications />} />
          <Route path="/student/chat" element={<StudentChat />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/resources" element={<Resources />} />
          <Route path="/student/resume-builder" element={<ResumeBuilder />} />
          <Route path="/student/documents" element={<StudentDocuments />} />
          <Route path="/student/assessment/:driveId" element={<StudentAssessment />} />
          <Route path="/student/assessments" element={<MyAssessments />} />
          <Route path="/student/ai-career-bot" element={<AICareerBot />} />

          {/* HR Routes */}
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/applications" element={<HRApplications />} />
          <Route path="/hr/skills" element={<HRSkills />} />
          <Route path="/hr/profile" element={<HRProfile />} />
          <Route path="/hr/offer-letters" element={<HROfferLetters />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </CompaniesProvider>
    </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
