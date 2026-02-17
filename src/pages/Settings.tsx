import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Link2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const SettingsPage = () => {
  const { tenantId, tenantName, loading: tenantLoading } = useTenant();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [waAccount, setWaAccount] = useState<any>(null);
  const [loadingWa, setLoadingWa] = useState(true);
  const { toast } = useToast();

  // Link WA account form
  const [waLabel, setWaLabel] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [linking, setLinking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setName(tenantName || "");
  }, [tenantName]);

  const fetchWaAccount = async () => {
    if (!tenantId) return;
    setLoadingWa(true);
    const { data } = await supabase
      .from("wa_accounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .limit(1)
      .maybeSingle();
    setWaAccount(data);
    setLoadingWa(false);
  };

  useEffect(() => {
    fetchWaAccount();
  }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    await supabase.from("tenants").update({ name }).eq("id", tenantId);
    setSaving(false);
    toast({ title: "تم حفظ الإعدادات" });
  };

  const handleLinkWaAccount = async () => {
    if (!tenantId || !wabaId.trim() || !waLabel.trim()) return;
    setLinking(true);
    const { error } = await supabase.from("wa_accounts").insert({
      tenant_id: tenantId,
      waba_id: wabaId.trim(),
      label: waLabel.trim(),
    });
    setLinking(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم ربط حساب واتساب بنجاح" });
      setDialogOpen(false);
      setWaLabel("");
      setWabaId("");
      fetchWaAccount();
    }
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
          <TabsTrigger value="account">حساب واتساب</TabsTrigger>
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
          <div className="bg-card rounded-xl border border-border p-6 space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">حساب واتساب للأعمال</h3>
              {!waAccount && !loadingWa && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Link2 className="w-4 h-4 ml-2" />
                      ربط حساب واتساب
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ربط حساب واتساب للأعمال</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="text-sm font-medium">اسم الحساب</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="مثال: حساب الشركة الرئيسي"
                          value={waLabel}
                          onChange={(e) => setWaLabel(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">معرف حساب الأعمال (WABA ID)</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="مثال: 123456789012345"
                          dir="ltr"
                          value={wabaId}
                          onChange={(e) => setWabaId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          تجده في لوحة تحكم Meta Business → WhatsApp → إعدادات الحساب
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">إلغاء</Button>
                      </DialogClose>
                      <Button onClick={handleLinkWaAccount} disabled={linking || !wabaId.trim() || !waLabel.trim()}>
                        {linking && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                        ربط الحساب
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {loadingWa ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : waAccount ? (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">الحساب مربوط</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">اسم الحساب</Label>
                    <p className="text-sm font-medium mt-0.5">{waAccount.label}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">WABA ID</Label>
                    <p className="text-sm font-mono mt-0.5" dir="ltr">{waAccount.waba_id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">معرف الحساب</Label>
                    <p className="text-sm font-mono mt-0.5" dir="ltr">{waAccount.id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">تاريخ الربط</Label>
                    <p className="text-sm mt-0.5">{new Date(waAccount.created_at).toLocaleDateString("ar")}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">لم يتم ربط حساب واتساب بعد</p>
                <p className="text-sm mt-1">اربط حسابك من زر "ربط حساب واتساب" أعلاه</p>
              </div>
            )}
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
