import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Phone, Plus, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const numbers = [
  { id: 1, phone: "+966 50 123 4567", name: "الخط الرئيسي", status: "connected" as const, type: "connected", addedAt: "2024-01-15", lastActive: "منذ 5 دقائق" },
  { id: 2, phone: "+15557285727", name: "alazab", status: "connected" as const, type: "digital", addedAt: "2024-02-20", lastActive: "منذ 12 دقيقة" },
  { id: 3, phone: "+15557245001", name: "alazabfix", status: "connected" as const, type: "digital", addedAt: "2024-03-10", lastActive: "منذ ساعة" },
];

const statusMap = {
  connected: { status: "success" as const, label: "متصل" },
  disconnected: { status: "danger" as const, label: "غير متصل" },
  pending: { status: "warning" as const, label: "قيد التفعيل" },
};

const NumbersPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="إدارة الأرقام" description="إدارة أرقام واتساب المتصلة والرقمية">
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة رقم
        </Button>
      </PageHeader>

      <Tabs defaultValue="all" className="animate-fade-in">
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل ({numbers.length})</TabsTrigger>
          <TabsTrigger value="connected">متصلة</TabsTrigger>
          <TabsTrigger value="digital">رقمية</TabsTrigger>
          <TabsTrigger value="sandbox">بيئة الاختبار</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث بالرقم أو الاسم..." className="pr-9" />
          </div>
        </div>

        <TabsContent value="all">
          <div className="bg-card rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الرقم</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الاسم</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ الإضافة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">آخر نشاط</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {numbers.map((num) => (
                  <tr key={num.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-sm font-medium" dir="ltr">{num.phone}</td>
                    <td className="p-4 text-sm">{num.name}</td>
                    <td className="p-4">
                      <StatusBadge status={statusMap[num.status as keyof typeof statusMap].status} label={statusMap[num.status as keyof typeof statusMap].label} />
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{num.addedAt}</td>
                    <td className="p-4 text-sm text-muted-foreground">{num.lastActive}</td>
                    <td className="p-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>خيارات</TooltipContent>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="connected">
          <div className="bg-card rounded-xl border border-border p-8">
            <EmptyState icon={Phone} title="لا توجد أرقام متصلة بشريحة" description="قم بربط رقم هاتف عبر شريحة SIM للبدء" actionLabel="ربط رقم جديد" onAction={() => {}} />
          </div>
        </TabsContent>
        <TabsContent value="digital">
          <div className="bg-card rounded-xl border border-border p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الرقم</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الاسم</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">آخر نشاط</th>
                </tr>
              </thead>
              <tbody>
                {numbers.filter(n => n.type === "digital").map(num => (
                  <tr key={num.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium" dir="ltr">{num.phone}</td>
                    <td className="p-4 text-sm">{num.name}</td>
                    <td className="p-4"><StatusBadge status="success" label="متصل" /></td>
                    <td className="p-4 text-sm text-muted-foreground">{num.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="sandbox">
          <div className="bg-card rounded-xl border border-border p-8">
            <EmptyState icon={Phone} title="لا توجد أرقام اختبار" description="أنشئ رقم بيئة اختبار لتجربة الرسائل" actionLabel="إنشاء بيئة اختبار" onAction={() => {}} />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default NumbersPage;
