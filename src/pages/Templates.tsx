import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Search, RefreshCw, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";

const statusStyleMap: Record<string, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  PAUSED: "warning",
};

const statusLabelMap: Record<string, string> = {
  APPROVED: "موافق عليه",
  PENDING: "قيد المراجعة",
  REJECTED: "مرفوض",
  PAUSED: "متوقف",
};

const categoryMap: Record<string, string> = {
  UTILITY: "خدمي",
  MARKETING: "تسويقي",
  AUTH: "مصادقة",
};

const TemplatesPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    if (!tenantId) return;
    let query = supabase.from("templates").select("*").eq("tenant_id", tenantId).order("updated_at", { ascending: false });
    if (search) query = query.ilike("name", `%${search}%`);
    if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
    if (categoryFilter !== "all") query = query.eq("category", categoryFilter as any);
    const { data } = await query.limit(100);
    setTemplates(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, [tenantId, search, statusFilter, categoryFilter]);

  const handleSync = async () => {
    if (!tenantId) return;
    setSyncing(true);
    const { data: account } = await supabase.from("wa_accounts").select("id").eq("tenant_id", tenantId).limit(1).maybeSingle();
    if (!account) {
      toast({ title: "خطأ", description: "لا يوجد حساب واتساب مربوط", variant: "destructive" });
      setSyncing(false);
      return;
    }
    const { error } = await supabase.functions.invoke("templates_sync", {
      body: { tenant_id: tenantId, wa_account_id: account.id },
    });
    setSyncing(false);
    if (error) {
      toast({ title: "خطأ في المزامنة", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تمت المزامنة بنجاح" });
      fetchTemplates();
    }
  };

  if (tenantLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="قوالب الرسائل" description="إدارة ومزامنة قوالب رسائل واتساب">
        <Button variant="outline" className="gap-2" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />مزامنة
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في القوالب..." className="pr-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="APPROVED">موافق عليه</SelectItem>
            <SelectItem value="PENDING">قيد المراجعة</SelectItem>
            <SelectItem value="REJECTED">مرفوض</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الفئة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            <SelectItem value="UTILITY">خدمي</SelectItem>
            <SelectItem value="MARKETING">تسويقي</SelectItem>
            <SelectItem value="AUTH">مصادقة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {templates.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={FileText} title="لا توجد قوالب" description="اضغط مزامنة لجلب القوالب من واتساب" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الاسم</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الفئة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">اللغة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">النص</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm font-medium font-mono" dir="ltr">{t.name}</td>
                  <td className="p-4"><StatusBadge status={statusStyleMap[t.status] || "neutral"} label={statusLabelMap[t.status] || t.status} /></td>
                  <td className="p-4 text-sm">{categoryMap[t.category] || t.category}</td>
                  <td className="p-4 text-sm text-muted-foreground">{t.language}</td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{t.body || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TemplatesPage;
