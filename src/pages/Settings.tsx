import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="الإعدادات" description="إعدادات النظام والتفضيلات" />

      <Tabs defaultValue="general" className="animate-fade-in">
        <TabsList className="mb-6">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6 max-w-2xl">
            <div>
              <Label className="text-sm font-medium">اسم الشركة</Label>
              <Input className="mt-1.5" defaultValue="شركة المثال" />
            </div>
            <div>
              <Label className="text-sm font-medium">البريد الإلكتروني</Label>
              <Input className="mt-1.5" defaultValue="admin@example.com" dir="ltr" />
            </div>
            <div>
              <Label className="text-sm font-medium">المنطقة الزمنية</Label>
              <Input className="mt-1.5" defaultValue="Asia/Riyadh" dir="ltr" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">الوضع الداكن</p>
                <p className="text-xs text-muted-foreground">تفعيل الوضع الليلي</p>
              </div>
              <Switch />
            </div>
            <Button>حفظ التغييرات</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 max-w-2xl">
            {["رسالة واردة جديدة", "فشل إرسال رسالة", "فشل Webhook", "مزامنة القوالب", "انتهاء صلاحية مفتاح API"].map((item) => (
              <div key={item} className="flex items-center justify-between py-2">
                <p className="text-sm">{item}</p>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">المصادقة الثنائية</p>
                <p className="text-xs text-muted-foreground">طبقة أمان إضافية لحسابك</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">تسجيل الخروج التلقائي</p>
                <p className="text-xs text-muted-foreground">بعد 30 دقيقة من عدم النشاط</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label className="text-sm font-medium">تغيير كلمة المرور</Label>
              <Input type="password" className="mt-1.5" placeholder="كلمة المرور الحالية" />
              <Input type="password" className="mt-2" placeholder="كلمة المرور الجديدة" />
              <Button className="mt-3">تحديث</Button>
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
              <Input className="mt-1.5" defaultValue="459851797218855" dir="ltr" readOnly />
            </div>
            <div>
              <Label className="text-sm font-medium">حد الطلبات (Rate Limit)</Label>
              <p className="text-xs text-muted-foreground mt-1">250 طلب/دقيقة - 80 طلب/ثانية</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
