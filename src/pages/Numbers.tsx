import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Phone, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";

const statusMap: Record<string, { status: "success" | "danger" | "warning"; label: string }> = {
  active: { status: "success", label: "متصل" },
  connected: { status: "success", label: "متصل" },
  disconnected: { status: "danger", label: "غير متصل" },
  pending: { status: "warning", label: "قيد التفعيل" },
};

const NumbersPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    supabase
      .from("wa_numbers")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setNumbers(data || []);
        setLoading(false);
      });
  }, [tenantId]);

  if (tenantLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const byType = (type: string) => numbers.filter((n) => n.type === type);

  const renderTable = (items: any[]) => {
    if (items.length === 0) {
      return (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={Phone} title="لا توجد أرقام" description="سيتم إضافة الأرقام عند ربط حساب واتساب" />
        </div>
      );
    }
    return (
      <div className="bg-card rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الرقم</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">النوع</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ الإضافة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">آخر نشاط</th>
            </tr>
          </thead>
          <tbody>
            {items.map((num) => {
              const st = statusMap[num.status] || { status: "neutral" as const, label: num.status };
              return (
                <tr key={num.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm font-medium" dir="ltr">{num.phone_e164}</td>
                  <td className="p-4 text-sm">{num.type}</td>
                  <td className="p-4"><StatusBadge status={st.status} label={st.label} /></td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(num.created_at).toLocaleDateString("ar")}</td>
                  <td className="p-4 text-sm text-muted-foreground">{num.last_active_at ? new Date(num.last_active_at).toLocaleDateString("ar") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader title="إدارة الأرقام" description="إدارة أرقام واتساب المتصلة والرقمية" />

      <Tabs defaultValue="all" className="animate-fade-in">
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل ({numbers.length})</TabsTrigger>
          <TabsTrigger value="connected">متصلة ({byType("connected").length})</TabsTrigger>
          <TabsTrigger value="digital">رقمية ({byType("digital").length})</TabsTrigger>
          <TabsTrigger value="sandbox">اختبار ({byType("sandbox").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderTable(numbers)}</TabsContent>
        <TabsContent value="connected">{renderTable(byType("connected"))}</TabsContent>
        <TabsContent value="digital">{renderTable(byType("digital"))}</TabsContent>
        <TabsContent value="sandbox">{renderTable(byType("sandbox"))}</TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default NumbersPage;
