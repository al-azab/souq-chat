import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Search, Shield, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";

const AuditPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    if (!tenantId) return;
    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (search) query = query.ilike("action", `%${search}%`);
    if (entityFilter !== "all") query = query.eq("entity", entityFilter);
    query.limit(100).then(({ data }) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, [tenantId, search, entityFilter]);

  if (tenantLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="سجلات التدقيق" description="سجل كامل لكل الأفعال الحساسة في النظام" />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في السجلات..." className="pr-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الكيان" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الكيانات</SelectItem>
            <SelectItem value="api_keys">API Key</SelectItem>
            <SelectItem value="webhook_endpoints">Webhook</SelectItem>
            <SelectItem value="media_files">وسائط</SelectItem>
            <SelectItem value="templates">قالب</SelectItem>
            <SelectItem value="messages">رسائل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logs.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={Shield} title="لا توجد سجلات" description="ستظهر سجلات التدقيق هنا عند تنفيذ عمليات حساسة" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الإجراء</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الكيان</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">التفاصيل</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">IP</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm font-medium">{log.action}</td>
                  <td className="p-4 text-sm text-muted-foreground">{log.entity}</td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{JSON.stringify(log.meta)}</td>
                  <td className="p-4 text-sm text-muted-foreground font-mono" dir="ltr">{log.ip || "—"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString("ar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AuditPage;
