import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Download, Trash2, Eye, Copy, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const mediaItems = [
  { id: 1, messageId: "msg_001", phone: "+966501234567", filename: "receipt.pdf", mime: "application/pdf", size: "1.2 MB", type: "مستند", received: "2024-03-15 10:30" },
  { id: 2, messageId: "msg_002", phone: "+966559876543", filename: "photo_2024.jpg", mime: "image/jpeg", size: "3.4 MB", type: "صورة", received: "2024-03-15 09:15" },
  { id: 3, messageId: "msg_003", phone: "+971501112222", filename: "voice_note.ogg", mime: "audio/ogg", size: "450 KB", type: "صوت", received: "2024-03-14 16:45" },
  { id: 4, messageId: "msg_004", phone: "+966543334444", filename: "video_clip.mp4", mime: "video/mp4", size: "12.1 MB", type: "فيديو", received: "2024-03-14 14:20" },
  { id: 5, messageId: "msg_005", phone: "+201055556666", filename: "contract.pdf", mime: "application/pdf", size: "2.8 MB", type: "مستند", received: "2024-03-13 11:00" },
];

const typeColorMap: Record<string, "info" | "success" | "warning" | "neutral"> = {
  "صورة": "info",
  "فيديو": "success",
  "مستند": "warning",
  "صوت": "neutral",
};

const MediaPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="الوسائط" description="إدارة الملفات والوسائط المستلمة والمرفوعة">
        <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />تصدير</Button>
        <Button variant="destructive" className="gap-2"><Trash2 className="w-4 h-4" />حذف المحدد</Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث بالملف أو الرقم..." className="pr-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue placeholder="النوع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="image">صور</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
            <SelectItem value="document">مستند</SelectItem>
            <SelectItem value="audio">صوت</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-36"><SelectValue placeholder="الفترة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الزمن</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="7d">آخر 7 أيام</SelectItem>
            <SelectItem value="30d">آخر 30 يوم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 w-10"><Checkbox /></th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">معرف الرسالة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الرقم</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الملف</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الحجم</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">النوع</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">تم الاستلام</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {mediaItems.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4"><Checkbox /></td>
                <td className="p-4 text-xs font-mono text-muted-foreground" dir="ltr">{item.messageId}</td>
                <td className="p-4 text-sm" dir="ltr">{item.phone}</td>
                <td className="p-4 text-sm font-medium">{item.filename}</td>
                <td className="p-4 text-sm text-muted-foreground">{item.size}</td>
                <td className="p-4"><StatusBadge status={typeColorMap[item.type] || "neutral"} label={item.type} /></td>
                <td className="p-4 text-sm text-muted-foreground">{item.received}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    {[
                      { icon: Eye, tip: "عرض" },
                      { icon: Copy, tip: "نسخ الرابط" },
                      { icon: Download, tip: "تنزيل" },
                      { icon: Trash2, tip: "حذف" },
                    ].map(({ icon: Icon, tip }) => (
                      <Tooltip key={tip}>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{tip}</TooltipContent>
                      </Tooltip>
                    ))}
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

export default MediaPage;
