import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone, MessageSquare, AlertTriangle, GitBranch, Plus, Webhook, Key, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { Link } from "react-router-dom";

const quickActions = [
  { label: "إضافة رقم", icon: Phone, path: "/numbers" },
  { label: "إنشاء Webhook", icon: Webhook, path: "/webhooks" },
  { label: "مفتاح API جديد", icon: Key, path: "/api-keys" },
  { label: "سير عمل جديد", icon: Zap, path: "/workflows" },
];

const statusMap: Record<string, { status: "success" | "warning" | "danger"; label: string }> = {
  delivered: { status: "success", label: "تم التسليم" },
  read: { status: "success", label: "تم القراءة" },
  sent: { status: "success", label: "تم الإرسال" },
  queued: { status: "warning", label: "قيد الانتظار" },
  failed: { status: "danger", label: "فشل" },
};

const Dashboard = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [stats, setStats] = useState({ numbers: 0, messagesToday: 0, errors: 0, workflows: 0 });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [numbersRes, msgTodayRes, errorsRes, workflowsRes, recentRes] = await Promise.all([
        supabase.from("wa_numbers").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", today.toISOString()),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "failed").gte("created_at", today.toISOString()),
        supabase.from("workflows").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("is_enabled", true),
        supabase.from("messages").select("id, text, status, direction, created_at, conversations(contacts(phone_e164, display_name))").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(10),
      ]);

      setStats({
        numbers: numbersRes.count || 0,
        messagesToday: msgTodayRes.count || 0,
        errors: errorsRes.count || 0,
        workflows: workflowsRes.count || 0,
      });

      setRecentMessages(recentRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [tenantId]);

  if (tenantLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="لوحة المعلومات" description="نظرة عامة على نشاط WhatsApp Business" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="الأرقام المتصلة" value={stats.numbers} icon={Phone} />
        <KPICard title="الرسائل اليوم" value={stats.messagesToday} icon={MessageSquare} iconColor="bg-info/10 text-info" />
        <KPICard title="الأخطاء" value={stats.errors} icon={AlertTriangle} iconColor="bg-warning/10 text-warning" />
        <KPICard title="سير العمل النشط" value={stats.workflows} icon={GitBranch} iconColor="bg-accent text-accent-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border animate-fade-in">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">الرسائل الحديثة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المرسل</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الرسالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الاتجاه</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">لا توجد رسائل بعد</td>
                  </tr>
                ) : (
                  recentMessages.map((msg) => {
                    const contact = (msg.conversations as any)?.contacts;
                    const st = statusMap[msg.status] || { status: "neutral" as const, label: msg.status };
                    return (
                      <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-sm font-medium" dir="ltr">{contact?.phone_e164 || "—"}</td>
                        <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{msg.text || "(وسائط)"}</td>
                        <td className="p-4 text-sm">{msg.direction === "inbound" ? "وارد" : "صادر"}</td>
                        <td className="p-4"><StatusBadge status={st.status} label={st.label} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">إجراءات سريعة</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <Plus className="w-4 h-4 text-muted-foreground mr-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
