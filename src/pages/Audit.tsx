import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const auditLogs = [
  { id: 1, user: "مدير النظام", action: "إنشاء مفتاح API", entity: "API Key", details: "مفتاح الإنتاج", time: "2024-03-15 10:30", severity: "info" as const },
  { id: 2, user: "مدير النظام", action: "حذف وسائط", entity: "Media", details: "حذف 3 ملفات", time: "2024-03-15 09:15", severity: "warning" as const },
  { id: 3, user: "عامل", action: "تعديل Webhook", entity: "Webhook", details: "تغيير URL الاستقبال", time: "2024-03-14 16:45", severity: "info" as const },
  { id: 4, user: "مدير النظام", action: "مزامنة القوالب", entity: "Template", details: "مزامنة 12 قالب", time: "2024-03-14 14:20", severity: "info" as const },
  { id: 5, user: "مدير النظام", action: "تعطيل مفتاح API", entity: "API Key", details: "مفتاح التقارير", time: "2024-03-13 11:00", severity: "danger" as const },
  { id: 6, user: "عامل", action: "إرسال قالب اختبار", entity: "Template", details: "welcome_message → +966...", time: "2024-03-13 09:30", severity: "info" as const },
];

const AuditPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="سجلات التدقيق" description="سجل كامل لكل الأفعال الحساسة في النظام" />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في السجلات..." className="pr-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue placeholder="المستخدم" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المستخدمين</SelectItem>
            <SelectItem value="admin">مدير النظام</SelectItem>
            <SelectItem value="operator">عامل</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue placeholder="الكيان" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الكيانات</SelectItem>
            <SelectItem value="apikey">API Key</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
            <SelectItem value="media">وسائط</SelectItem>
            <SelectItem value="template">قالب</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right text-xs font-medium text-muted-foreground p-4">المستخدم</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الإجراء</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الكيان</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">التفاصيل</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الوقت</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الأهمية</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4 text-sm font-medium">{log.user}</td>
                <td className="p-4 text-sm">{log.action}</td>
                <td className="p-4 text-sm text-muted-foreground">{log.entity}</td>
                <td className="p-4 text-sm text-muted-foreground">{log.details}</td>
                <td className="p-4 text-sm text-muted-foreground">{log.time}</td>
                <td className="p-4"><StatusBadge status={log.severity} label={log.severity === "info" ? "معلومة" : log.severity === "warning" ? "تحذير" : "حرج"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AuditPage;
