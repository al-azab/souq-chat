import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Phone,
  MessageSquare,
  Users,
  Image,
  FileText,
  Webhook,
  Key,
  GitBranch,
  Settings,
  Shield,
  LogOut,
  Activity,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "لوحة المعلومات", icon: LayoutDashboard, path: "/" },
  { label: "الأرقام", icon: Phone, path: "/numbers" },
  { label: "صندوق الوارد", icon: MessageSquare, path: "/inbox" },
  { label: "جهات الاتصال", icon: Users, path: "/contacts" },
  { label: "الوسائط", icon: Image, path: "/media" },
  { label: "معرض المشروعات", icon: Image, path: "/gallery" },
  { label: "القوالب", icon: FileText, path: "/templates" },
  { label: "الويبهوكس", icon: Webhook, path: "/webhooks" },
  { label: "مفاتيح API", icon: Key, path: "/api-keys" },
  { label: "سير العمل", icon: GitBranch, path: "/workflows" },
  { label: "السجلات", icon: Shield, path: "/audit" },
  { label: "تشخيص النظام", icon: Activity, path: "/diagnostics" },
  { label: "الإعدادات", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50 border-l border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-primary-foreground/90">واتساب بيزنس</h1>
            <p className="text-[11px] text-sidebar-muted">لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-hover"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-hover">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {(user?.user_metadata?.name || user?.email || "م").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.user_metadata?.name || "مستخدم"}</p>
            <p className="text-[11px] text-sidebar-muted truncate">{user?.email}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={signOut} className="text-sidebar-muted hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">تسجيل الخروج</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
