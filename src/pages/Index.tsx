import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone, MessageSquare, AlertTriangle, GitBranch, Plus, Webhook, Key, Zap, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { Link } from "react-router-dom";
import type { MsgStatus } from "@/lib/types";

const quickActions = [
  { label: "إضافة رقم",     icon: Phone,   path: "/numbers" },
  { label: "إنشاء Webhook", icon: Webhook, path: "/webhooks" },
  { label: "مفتاح API جديد",icon: Key,     path: "/api-keys" },
  { label: "سير عمل جديد",  icon: Zap,     path: "/workflows" },
];

const statusMap: Record<MsgStatus, { status: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  delivered: { status: "success", label: "تم التسليم" },
  read:      { status: "success", label: "تم القراءة" },
  sent:      { status: "success", label: "تم الإرسال" },
  queued:    { status: "warning", label: "قيد الانتظار" },
  failed:    { status: "danger",  label: "فشل" },
};

interface Stats {
  numbers: number;
  messagesToday: number;
  errors: number;
  workflows: number;
}

interface RecentMsg {
  id: string;
  text: string | null;
  status: string;
  direction: string;
  created_at: string;
  contact_phone: string | null;
  contact_name: string | null;
}

const Dashboard = () => {
  const { tenantId, tenantName, loading: tenantLoading } = useTenant();
  const [stats, setStats]           = useState<Stats>({ numbers: 0, messagesToday: 0, errors: 0, workflows: 0 });
  const [recentMessages, setRecent] = useState<RecentMsg[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!tenantId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const [numbersRes, msgTodayRes, errorsRes, workflowsRes, recentRes] = await Promise.all([
      supabase
        .from("wa_numbers")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .gte("created_at", todayISO),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("status", "failed")
        .gte("created_at", todayISO),
      supabase
        .from("workflows")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("is_enabled", true),
      supabase
        .from("messages")
        .select(`
          id, text, status, direction, created_at,
          conversations!inner(
            contacts(phone_e164, display_name)
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    setStats({
      numbers:      numbersRes.count  ?? 0,
      messagesToday: msgTodayRes.count ?? 0,
      errors:       errorsRes.count   ?? 0,
      workflows:    workflowsRes.count ?? 0,
    });

    // Flatten joined data safely
    const msgs: RecentMsg[] = (recentRes.data ?? []).map((m: any) => ({
      id:           m.id,
      text:         m.text,
      status:       m.status,
      direction:    m.direction,
      created_at:   m.created_at,
      contact_phone: m.conversations?.contacts?.phone_e164 ?? null,
      contact_name:  m.conversations?.contacts?.display_name ?? null,
    }));
    setRecent(msgs);

    if (!silent) setLoading(false);
    else setRefreshing(false);
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime: refresh stats on new messages
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `tenant_id=eq.${tenantId}`,
      }, () => fetchData(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId, fetchData]);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tenantName || "لوحة المعلومات"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">نظرة عامة على نشاط WhatsApp Business</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="الأرقام المتصلة"  value={stats.numbers}      icon={Phone} />
        <KPICard title="الرسائل اليوم"    value={stats.messagesToday} icon={MessageSquare} iconColor="bg-info/10 text-info" />
        <KPICard title="الأخطاء اليوم"    value={stats.errors}        icon={AlertTriangle} iconColor="bg-warning/10 text-warning" />
        <KPICard title="سير العمل النشط"  value={stats.workflows}     icon={GitBranch}    iconColor="bg-accent text-accent-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border animate-fade-in">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">الرسائل الحديثة</h3>
            <span className="text-xs text-muted-foreground">آخر 10 رسائل</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">جهة الاتصال</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الرسالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الاتجاه</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                      لا توجد رسائل بعد
                    </td>
                  </tr>
                ) : (
                  recentMessages.map((msg) => {
                    const st = statusMap[msg.status as MsgStatus] ?? { status: "neutral" as const, label: msg.status };
                    return (
                      <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-medium">{msg.contact_name || "—"}</p>
                          <p className="text-xs text-muted-foreground font-mono" dir="ltr">{msg.contact_phone || "—"}</p>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                          {msg.text || "(وسائط)"}
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                            msg.direction === "inbound"
                              ? "bg-info/10 text-info border-info/20"
                              : "bg-success/10 text-success border-success/20"
                          }`}>
                            {msg.direction === "inbound" ? "◀ وارد" : "▶ صادر"}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={st.status} label={st.label} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <h3 className="font-semibold mb-4">إجراءات سريعة</h3>
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
                <span className="text-sm font-medium flex-1">{action.label}</span>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
