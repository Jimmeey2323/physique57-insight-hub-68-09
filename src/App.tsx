
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalNoteTaker } from "@/components/ui/GlobalNoteTaker";
import Index from "./pages/Index";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import SalesAnalytics from "./pages/SalesAnalytics";
import FunnelLeads from "./pages/FunnelLeads";
import ClientRetention from "./pages/ClientRetention";
import TrainerPerformance from "./pages/TrainerPerformance";
import ClassAttendance from "./pages/ClassAttendance";
import DiscountsPromotions from "./pages/DiscountsPromotions";
import Sessions from "./pages/Sessions";
import PowerCycleVsBarre from "./pages/PowerCycleVsBarre";
import LateCancellations from "./pages/LateCancellations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalNoteTaker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/executive-summary" element={<ExecutiveSummary />} />
          <Route path="/sales-analytics" element={<SalesAnalytics />} />
          <Route path="/funnel-leads" element={<FunnelLeads />} />
          <Route path="/client-retention" element={<ClientRetention />} />
          <Route path="/trainer-performance" element={<TrainerPerformance />} />
          <Route path="/class-attendance" element={<ClassAttendance />} />
          <Route path="/discounts-promotions" element={<DiscountsPromotions />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/powercycle-vs-barre" element={<PowerCycleVsBarre />} />
          <Route path="/powercycle-vs-barre" element={<PowerCycleVsBarre />} />
          <Route path="/late-cancellations" element={<LateCancellations />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;