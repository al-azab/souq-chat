import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone, MessageSquare, AlertTriangle, GitBranch, Plus, Webhook, Key, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "السبت", وارد: 120, صادر: 80 },
  { name: "الأحد", وارد: 200, صادر: 150 },
  { name: "الاثنين", وارد: 180, صادر: 220 },
  { name: "الثلاثاء", وارد: 250, صادر: 190 },
  { name: "الأربعاء", وارد: 300, صادر: 280 },
  { name: "الخميس", وارد: 220, صادر: 200 },
  { name: "الجمعة", وارد: 150, صادر: 130 },
];

const recentMessages = [
  { id: 1, from: "+966 50 123 4567", message: "مرحباً، أريد الاستفسار عن الطلب", time: "منذ 5 دقائق", status: "success" as const, statusLabel: "تم التسليم" },
  { id: 2, from: "+966 55 987 6543", message: "شكراً لتواصلكم", time: "منذ 12 دقيقة", status: "success" as const, statusLabel: "تم القراءة" },
  { id: 3, from: "+971 50 111 2222", message: "هل يمكنني تغيير العنوان؟", time: "منذ 30 دقيقة", status: "warning" as const, statusLabel: "قيد الانتظار" },
  { id: 4, from: "+966 54 333 4444", message: "طلب إلغاء الاشتراك", time: "منذ ساعة", status: "danger" as const, statusLabel: "فشل" },
  { id: 5, from: "+20 10 555 6666", message: "تأكيد الحجز رقم #4521", time: "منذ ساعتين", status: "success" as const, statusLabel: "تم التسليم" },
];

const quickActions = [
  { label: "إضافة رقم", icon: Phone, path: "/numbers" },
  { label: "إنشاء Webhook", icon: Webhook, path: "/webhooks" },
  { label: "مفتاح API جديد", icon: Key, path: "/api-keys" },
  { label: "سير عمل جديد", icon: Zap, path: "/workflows" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <PageHeader title="لوحة المعلومات" description="نظرة عامة على نشاط WhatsApp Business" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="الأرقام المتصلة" value={3} change="+1 هذا الشهر" changeType="positive" icon={Phone} />
        <KPICard
          title="الرسائل اليوم"
          value="1,247"
          change="↑ 12% عن أمس"
          changeType="positive"
          icon={MessageSquare}
          iconColor="bg-info/10 text-info"
        />
        <KPICard
          title="الأخطاء"
          value={3}
          change="↓ 60% عن أمس"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="bg-warning/10 text-warning"
        />
        <KPICard
          title="سير العمل النشط"
          value={7}
          change="2 جديد هذا الأسبوع"
          changeType="neutral"
          icon={GitBranch}
          iconColor="bg-accent text-accent-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">الرسائل اليومية</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 70%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 70%, 40%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 80%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 80%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Cairo" }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  fontFamily: "Cairo",
                  borderRadius: "8px",
                  border: "1px solid hsl(214, 20%, 90%)",
                  direction: "rtl",
                }}
              />
              <Area type="monotone" dataKey="وارد" stroke="hsl(142, 70%, 40%)" fill="url(#colorIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="صادر" stroke="hsl(210, 80%, 52%)" fill="url(#colorOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <h3 className="font-semibold text-card-foreground mb-4">إجراءات سريعة</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <a
                key={action.path}
                href={action.path}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <Plus className="w-4 h-4 text-muted-foreground mr-auto" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Messages Table */}
      <div className="bg-card rounded-xl border border-border animate-fade-in">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-card-foreground">الرسائل الحديثة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">المرسل</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الرسالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الوقت</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentMessages.map((msg) => (
                <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm font-medium" dir="ltr">{msg.from}</td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{msg.message}</td>
                  <td className="p-4 text-sm text-muted-foreground">{msg.time}</td>
                  <td className="p-4"><StatusBadge status={msg.status} label={msg.statusLabel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
