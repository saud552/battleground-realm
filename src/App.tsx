import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SquadProvider } from "@/context/SquadContext";
import HomeScreen from "@/components/HomeScreen";
import BottomNav from "@/components/BottomNav";
import Profile from "@/pages/Profile";
import Store from "@/pages/Store";
import Squad from "@/pages/Squad";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    {children}
    <BottomNav />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SquadProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><HomeScreen /></AppLayout>} />
            <Route path="/store" element={<AppLayout><Store /></AppLayout>} />
            <Route path="/squad" element={<AppLayout><Squad /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SquadProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
