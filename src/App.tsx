import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SeniorModeProvider } from "@/contexts/SeniorModeContext";
import PrivateRoute from "@/components/PrivateRoute";
import { LoaderCircle } from "lucide-react";

// Lazy-loaded pages
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const MedicationSchedule = lazy(() => import("./pages/MedicationSchedule"));
const MedicationGuide = lazy(() => import("./pages/MedicationGuide"));
const AiChat = lazy(() => import("./pages/AiChat"));
const AddSupplement = lazy(() => import("./pages/AddSupplement"));
const MedicationTimeSetup = lazy(() => import("./pages/MedicationTimeSetup"));
const Settings = lazy(() => import("./pages/Settings"));
const Sounds = lazy(() => import("./pages/Sounds"));
const Terms = lazy(() => import("./pages/Terms"));
const TermsManage = lazy(() => import("./pages/TermsManage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
  </div>
);

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
              <div className="flex-1 overflow-y-auto">
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SeniorModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
