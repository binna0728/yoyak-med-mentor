import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SeniorModeProvider } from "@/contexts/SeniorModeContext";
import PrivateRoute from "@/components/PrivateRoute";

import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MedicationSchedule from "./pages/MedicationSchedule";
import MedicationGuide from "./pages/MedicationGuide";
import AiChat from "./pages/AiChat";
import AddSupplement from "./pages/AddSupplement";
import MedicationTimeSetup from "./pages/MedicationTimeSetup";
import Settings from "./pages/Settings";
import Sounds from "./pages/Sounds";
import Terms from "./pages/Terms";
import TermsManage from "./pages/TermsManage";
import NotFound from "./pages/NotFound";
import GlobalMenu from "./components/GlobalMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SeniorModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="h-screen flex flex-col" style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }}>
              <GlobalMenu />
              <div className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Onboarding />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                  <Route path="/schedule" element={<PrivateRoute><MedicationSchedule /></PrivateRoute>} />
                  <Route path="/guide/:id" element={<PrivateRoute><MedicationGuide /></PrivateRoute>} />
                  <Route path="/ai-chat" element={<PrivateRoute><AiChat /></PrivateRoute>} />
                  <Route path="/add/supplement" element={<PrivateRoute><AddSupplement /></PrivateRoute>} />
                  <Route path="/setup/time" element={<PrivateRoute><MedicationTimeSetup /></PrivateRoute>} />
                  <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                  <Route path="/sounds" element={<PrivateRoute><Sounds /></PrivateRoute>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/terms/manage" element={<PrivateRoute><TermsManage /></PrivateRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SeniorModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
