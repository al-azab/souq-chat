import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Key, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";

const ApiKeysPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchKeys = async () => {
    if (!tenantId) return;
    const { data } = await supabase.from("api_keys").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    setKeys(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchKeys(); }, [tenantId]);

  const handleCreate = async () => {
    if (!tenantId || !newKeyName) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("api_keys_manage", {
      body: { action: "create", tenant_id: tenantId, name: newKeyName, scopes: ["read:inbox", "write:messages"] },
    });
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      setGeneratedKey(data?.key || null);
      toast({ title: "تم إنشاء المفتاح" });
      fetchKeys();
    }
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast({ title: "تم النسخ" });
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
      <PageHeader title="مفاتيح API" description="إدارة مفاتيح الوصول وصلاحياتها">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setGeneratedKey(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />إنشاء مفتاح جديد</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{generatedKey ? "احفظ المفتاح الآن" : "إنشاء مفتاح API"}</DialogTitle></DialogHeader>
            {generatedKey ? (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all" dir="ltr">{generatedKey}</div>
                <p className="text-xs text-destructive font-medium">⚠️ هذا المفتاح يُعرض مرة واحدة فقط. انسخه الآن!</p>
                <Button onClick={copyKey} className="w-full gap-2"><Copy className="w-4 h-4" />نسخ المفتاح</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>اسم المفتاح</Label>
                  <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="مفتاح الإنتاج" className="mt-1" />
                </div>
                <Button onClick={handleCreate} disabled={saving || !newKeyName} className="w-full">
                  {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}إنشاء
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-4 text-sm text-accent-foreground animate-fade-in">
        <strong>⚠️ تنبيه أمني:</strong> المفتاح يُعرض مرة واحدة فقط عند الإنشاء. احتفظ به في مكان آمن.
      </div>

      {keys.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={Key} title="لا توجد مفاتيح API" description="أنشئ مفتاحًا للوصول إلى API" />
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {keys.map((key) => (
            <div key={key.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{key.name}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5" dir="ltr">{key.key_prefix}****</p>
                  </div>
                </div>
                <StatusBadge status={key.disabled_at ? "neutral" : "success"} label={key.disabled_at ? "معطل" : "نشط"} />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>آخر استخدام: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString("ar") : "لم يُستخدم"}</span>
                <span>أنشئ: {new Date(key.created_at).toLocaleDateString("ar")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApiKeysPage;
