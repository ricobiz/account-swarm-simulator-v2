
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProcessMonitorProvider } from "@/components/ProcessMonitorProvider";
import Index from "./pages/Index";
import Accounts from "./pages/Accounts";
import Auth from "./pages/Auth";
import ScenarioLaunch from "./pages/ScenarioLaunch";
import RPA from "./pages/RPA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProcessMonitorProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/scenario-launch" element={<ScenarioLaunch />} />
              <Route path="/rpa" element={<RPA />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProcessMonitorProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
