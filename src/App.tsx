import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Numbers from "./pages/Numbers";
import Inbox from "./pages/Inbox";
import Contacts from "./pages/Contacts";
import Media from "./pages/Media";
import Templates from "./pages/Templates";
import Webhooks from "./pages/Webhooks";
import ApiKeys from "./pages/ApiKeys";
import Workflows from "./pages/Workflows";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/numbers" element={<Numbers />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/media" element={<Media />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
