import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { tenantId, tenantName, loading: tenantLoading } = useTenant();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [waAccount, setWaAccount] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setName(tenantName || "");
  }, [tenantName]);

  useEffect(() => {
    if (!tenantId) return;
    supabase.from("wa_accounts").select("*").eq("tenant_id", tenantId).limit(1).maybeSingle().then(({ data }) => {
      setWaAccount(data);
    });
  }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    await supabase.from("tenants").update({ name }).eq("id", tenantId);
    setSaving(false);
    toast({ title: "تم حفظ الإعدادات" });
  };

  if (tenantLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="الإعدادات" description="إعدادات النظام والتفضيلات" />

      <Tabs defaultValue="general" className="animate-fade-in">
        <TabsList className="mb-6">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="account">الحساب</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6 max-w-2xl">
            <div>
              <Label className="text-sm font-medium">اسم المؤسسة</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">البريد الإلكتروني</Label>
              <Input className="mt-1.5" value={user?.email || ""} dir="ltr" readOnly />
            </div>
            <div>
              <Label className="text-sm font-medium">معرف المؤسسة</Label>
              <Input className="mt-1.5" value={tenantId || ""} dir="ltr" readOnly />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}حفظ التغييرات
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 max-w-2xl">
            <div>
              <Label className="text-sm font-medium">حساب واتساب</Label>
              {waAccount ? (
                <div className="mt-2 p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{waAccount.label}</p>
                  <p className="text-xs text-muted-foreground font-mono" dir="ltr">WABA ID: {waAccount.waba_id}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">لم يتم ربط حساب واتساب بعد</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 max-w-2xl">
            <div>
              <Label className="text-sm font-medium">إصدار API</Label>
              <Input className="mt-1.5" defaultValue="v24.0" dir="ltr" readOnly />
            </div>
            <div>
              <Label className="text-sm font-medium">معرف حساب الأعمال</Label>
              <Input className="mt-1.5" value={waAccount?.waba_id || "غير مربوط"} dir="ltr" readOnly />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
