import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, RefreshCw, Send, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const templates = [
  { id: 1, name: "welcome_message", status: "approved", statusLabel: "موافق عليه", category: "UTILITY", language: "ar", preview: "مرحباً {{1}}! شكراً لتواصلك معنا." },
  { id: 2, name: "order_confirmation", status: "approved", statusLabel: "موافق عليه", category: "UTILITY", language: "ar", preview: "تم تأكيد طلبك رقم {{1}}. سيتم التوصيل خلال {{2}} يوم." },
  { id: 3, name: "promotion_offer", status: "pending", statusLabel: "قيد المراجعة", category: "MARKETING", language: "ar", preview: "عرض خاص! خصم {{1}}% على جميع المنتجات حتى {{2}}." },
  { id: 4, name: "auth_otp", status: "approved", statusLabel: "موافق عليه", category: "AUTHENTICATION", language: "ar", preview: "رمز التحقق الخاص بك هو {{1}}. صالح لمدة {{2}} دقائق." },
  { id: 5, name: "feedback_request", status: "rejected", statusLabel: "مرفوض", category: "MARKETING", language: "ar", preview: "نود سماع رأيك! قيّم تجربتك من 1-5." },
];

const statusStyleMap: Record<string, "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

const categoryMap: Record<string, string> = {
  UTILITY: "خدمي",
  MARKETING: "تسويقي",
  AUTHENTICATION: "مصادقة",
};

const TemplatesPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="قوالب الرسائل" description="إدارة ومزامنة قوالب رسائل واتساب">
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" />مزامنة</Button>
        <Button className="gap-2"><Plus className="w-4 h-4" />إنشاء قالب</Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في القوالب..." className="pr-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="approved">موافق عليه</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue placeholder="الفئة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            <SelectItem value="utility">خدمي</SelectItem>
            <SelectItem value="marketing">تسويقي</SelectItem>
            <SelectItem value="auth">مصادقة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الاسم</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الفئة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">اللغة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">معاينة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4 text-sm font-medium font-mono" dir="ltr">{t.name}</td>
                <td className="p-4"><StatusBadge status={statusStyleMap[t.status]} label={t.statusLabel} /></td>
                <td className="p-4 text-sm">{categoryMap[t.category]}</td>
                <td className="p-4 text-sm text-muted-foreground">{t.language}</td>
                <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{t.preview}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-primary p-1"><Send className="w-3.5 h-3.5" /></button>
                      </TooltipTrigger>
                      <TooltipContent>إرسال اختبار</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </TooltipTrigger>
                      <TooltipContent>المزيد</TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default TemplatesPage;
