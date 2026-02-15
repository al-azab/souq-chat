import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, GitBranch, Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";

const WorkflowsPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    if (!tenantId) return;
    const { data } = await supabase.from("workflows").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    setWorkflows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchWorkflows(); }, [tenantId]);

  const toggleEnabled = async (id: string, current: boolean) => {
    await supabase.from("workflows").update({ is_enabled: !current }).eq("id", id);
    fetchWorkflows();
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
      <PageHeader title="سير العمل" description="إنشاء وإدارة قواعد الأتمتة">
        <Button className="gap-2"><Plus className="w-4 h-4" />سير عمل جديد</Button>
      </PageHeader>

      {workflows.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={GitBranch} title="لا يوجد سير عمل" description="أنشئ قواعد أتمتة للرد التلقائي وتعيين المحادثات" />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {workflows.map((wf) => {
            const rules = wf.rules as any;
            return (
              <div key={wf.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{wf.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        الحدث: {rules?.trigger || "—"} → {rules?.actions?.length || 0} إجراء
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={wf.is_enabled ? "success" : "warning"} label={wf.is_enabled ? "نشط" : "متوقف"} />
                    <button
                      onClick={() => toggleEnabled(wf.id, wf.is_enabled)}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      {wf.is_enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>أنشئ: {new Date(wf.created_at).toLocaleDateString("ar")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkflowsPage;
