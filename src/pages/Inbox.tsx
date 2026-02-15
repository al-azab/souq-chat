import DashboardLayout from "@/components/DashboardLayout";
import { Search, Paperclip, Send, Phone, User, Tag, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";

const conversations = [
  { id: 1, name: "أحمد محمد", phone: "+966501234567", lastMsg: "مرحباً، أريد الاستفسار عن الطلب", time: "5 د", unread: 2 },
  { id: 2, name: "سارة أحمد", phone: "+966559876543", lastMsg: "شكراً لتواصلكم", time: "12 د", unread: 0 },
  { id: 3, name: "خالد العلي", phone: "+971501112222", lastMsg: "هل يمكنني تغيير العنوان؟", time: "30 د", unread: 1 },
  { id: 4, name: "فاطمة حسن", phone: "+966543334444", lastMsg: "طلب إلغاء الاشتراك", time: "1 س", unread: 0 },
  { id: 5, name: "محمد سعيد", phone: "+201055556666", lastMsg: "تأكيد الحجز", time: "2 س", unread: 0 },
];

const messages = [
  { id: 1, from: "contact", text: "مرحباً، أريد الاستفسار عن حالة طلبي رقم #4521", time: "10:30 ص" },
  { id: 2, from: "agent", text: "أهلاً أحمد! أنا أتحقق من حالة طلبك الآن", time: "10:31 ص" },
  { id: 3, from: "agent", text: "طلبك رقم #4521 تم شحنه وسيصل خلال 2-3 أيام عمل", time: "10:32 ص" },
  { id: 4, from: "contact", text: "ممتاز، شكراً لكم! هل يمكنني تتبع الشحنة؟", time: "10:35 ص" },
  { id: 5, from: "agent", text: "بالتأكيد، إليك رابط التتبع: https://track.example.com/4521", time: "10:36 ص" },
];

const InboxPage = () => {
  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3rem)] -m-6 animate-fade-in">
        {/* Conversations List - Right */}
        <div className="w-80 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">صندوق الوارد</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث في المحادثات..." className="pr-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv, idx) => (
              <div
                key={conv.id}
                className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${idx === 0 ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {conv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{conv.name}</p>
                      <span className="text-[11px] text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMsg}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area - Center */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              أ
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">أحمد محمد</p>
              <p className="text-xs text-muted-foreground" dir="ltr">+966 50 123 4567</p>
            </div>
            <StatusBadge status="success" label="متصل" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "agent" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.from === "agent"
                    ? "bg-card border border-border rounded-br-sm"
                    : "bg-primary text-primary-foreground rounded-bl-sm"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === "agent" ? "text-muted-foreground" : "text-primary-foreground/70"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
                <Paperclip className="w-5 h-5" />
              </button>
              <Input placeholder="اكتب رسالة..." className="flex-1" />
              <button className="bg-primary text-primary-foreground p-2.5 rounded-lg hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Details - Left */}
        <div className="w-72 border-r border-border bg-card flex flex-col">
          <div className="p-5 text-center border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mx-auto mb-3">
              أ
            </div>
            <h3 className="font-semibold">أحمد محمد</h3>
            <p className="text-sm text-muted-foreground" dir="ltr">+966 50 123 4567</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">الحالة</p>
              <StatusBadge status="success" label="نشط" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">المسؤول</p>
              <p className="text-sm">مدير النظام</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">إجمالي الرسائل</p>
              <p className="text-sm font-semibold">147</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الوسوم</p>
              <div className="flex flex-wrap gap-1">
                <StatusBadge status="info" label="VIP" />
                <StatusBadge status="neutral" label="عميل" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">ملاحظات</p>
              <textarea className="w-full border border-border rounded-lg p-2 text-sm bg-background resize-none" rows={3} placeholder="أضف ملاحظة..." />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InboxPage;
