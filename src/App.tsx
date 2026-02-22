import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SeniorModeProvider } from "@/contexts/SeniorModeContext";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import UploadPage from "./pages/app/Upload";
import Medications from "./pages/app/Medications";
import MedicationDetail from "./pages/app/MedicationDetail";
import SchedulePage from "./pages/app/SchedulePage";
import Warnings from "./pages/app/Warnings";
import Family from "./pages/app/Family";
import Profile from "./pages/app/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SeniorModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/app" element={<AppLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="medications" element={<Medications />} />
                <Route path="medications/:id" element={<MedicationDetail />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="warnings" element={<Warnings />} />
                <Route path="family" element={<Family />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SeniorModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
