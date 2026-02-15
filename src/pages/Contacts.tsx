import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Search, Plus, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const contacts = [
  { id: 1, phone: "+966501234567", name: "أحمد محمد", waId: "966501234567", created: "2024-01-15" },
  { id: 2, phone: "+966559876543", name: "سارة أحمد", waId: "966559876543", created: "2024-02-20" },
  { id: 3, phone: "+971501112222", name: "خالد العلي", waId: "971501112222", created: "2024-03-05" },
  { id: 4, phone: "+966543334444", name: "فاطمة حسن", waId: "966543334444", created: "2024-03-10" },
  { id: 5, phone: "+201055556666", name: "محمد سعيد", waId: "201055556666", created: "2024-04-01" },
];

const ContactsPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="جهات الاتصال" description="إدارة جهات اتصال واتساب">
        <Button className="gap-2"><Plus className="w-4 h-4" />إضافة جهة اتصال</Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث بالهاتف أو الاسم..." className="pr-9" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الهاتف</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">اسم العرض</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">معرف واتساب</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ الإنشاء</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4 text-sm font-medium" dir="ltr">{c.phone}</td>
                <td className="p-4 text-sm">{c.name}</td>
                <td className="p-4 text-sm text-muted-foreground font-mono text-xs" dir="ltr">{c.waId}</td>
                <td className="p-4 text-sm text-muted-foreground">{c.created}</td>
                <td className="p-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>عرض التفاصيل</TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default ContactsPage;
