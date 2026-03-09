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
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CaptureMethod from "./pages/CaptureMethod";
import PillCamera from "./pages/PillCamera";
import PrescriptionCamera from "./pages/PrescriptionCamera";
import FileUpload from "./pages/FileUpload";
import OcrProcessing from "./pages/OcrProcessing";
import OcrResultCheck from "./pages/OcrResultCheck";
import OcrResultEdit from "./pages/OcrResultEdit";
import MedicationTimeSetup from "./pages/MedicationTimeSetup";
import MedicationSchedule from "./pages/MedicationSchedule";
import MedicationGuide from "./pages/MedicationGuide";
import SilverModeGuide from "./pages/SilverModeGuide";
import AiChat from "./pages/AiChat";
import TtsPlayer from "./pages/TtsPlayer";
import Settings from "./pages/Settings";
import AddSupplement from "./pages/AddSupplement";
import Sounds from "./pages/Sounds";
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
              <Route path="/" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/capture" element={<PrivateRoute><CaptureMethod /></PrivateRoute>} />
              <Route path="/camera/pill" element={<PrivateRoute><PillCamera /></PrivateRoute>} />
              <Route path="/camera/prescription" element={<PrivateRoute><PrescriptionCamera /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><FileUpload /></PrivateRoute>} />
              <Route path="/processing" element={<PrivateRoute><OcrProcessing /></PrivateRoute>} />
              <Route path="/result/check" element={<PrivateRoute><OcrResultCheck /></PrivateRoute>} />
              <Route path="/result/edit" element={<PrivateRoute><OcrResultEdit /></PrivateRoute>} />
              <Route path="/setup/time" element={<PrivateRoute><MedicationTimeSetup /></PrivateRoute>} />
              <Route path="/schedule" element={<PrivateRoute><MedicationSchedule /></PrivateRoute>} />
              <Route path="/guide/:id" element={<PrivateRoute><MedicationGuide /></PrivateRoute>} />
              <Route path="/guide/:id/silver" element={<PrivateRoute><SilverModeGuide /></PrivateRoute>} />
              <Route path="/ai-chat" element={<PrivateRoute><AiChat /></PrivateRoute>} />
              <Route path="/guide/:id/tts" element={<PrivateRoute><TtsPlayer /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/add/supplement" element={<PrivateRoute><AddSupplement /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SeniorModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
