import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Globe, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";

const WebhooksPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchEndpoints = async () => {
    if (!tenantId) return;
    const { data } = await supabase.from("webhook_endpoints").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    setEndpoints(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEndpoints(); }, [tenantId]);

  const handleAdd = async () => {
    if (!tenantId || !newUrl) return;
    setSaving(true);
    const { error } = await supabase.from("webhook_endpoints").insert({ tenant_id: tenantId, url: newUrl, is_enabled: true });
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم إنشاء Webhook" });
      setDialogOpen(false);
      setNewUrl("");
      fetchEndpoints();
    }
  };

  const toggleEnabled = async (id: string, current: boolean) => {
    await supabase.from("webhook_endpoints").update({ is_enabled: !current }).eq("id", id);
    fetchEndpoints();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("webhook_endpoints").delete().eq("id", id);
    fetchEndpoints();
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
      <PageHeader title="الويبهوكس" description="إدارة نقاط الاستقبال والأحداث">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />إنشاء Webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إنشاء Webhook جديد</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>عنوان URL</Label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://example.com/webhook" dir="ltr" className="mt-1" />
              </div>
              <Button onClick={handleAdd} disabled={saving || !newUrl} className="w-full">
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}إنشاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {endpoints.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={Globe} title="لا توجد ويبهوكس" description="أنشئ نقطة استقبال لتلقي أحداث واتساب" />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {endpoints.map((ep) => (
            <div key={ep.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium font-mono" dir="ltr">{ep.url}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={ep.is_enabled ? "success" : "neutral"} label={ep.is_enabled ? "نشط" : "معطل"} />
                      <span className="text-xs text-muted-foreground">أنشئ: {new Date(ep.created_at).toLocaleDateString("ar")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={ep.is_enabled} onCheckedChange={() => toggleEnabled(ep.id, ep.is_enabled)} />
                  <button onClick={() => handleDelete(ep.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default WebhooksPage;
