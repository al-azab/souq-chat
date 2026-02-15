import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Play, MoreHorizontal, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const webhooks = [
  { id: 1, url: "https://api.example.com/webhooks/wa", events: ["message.received", "message.status.updated"], status: "active", lastDelivery: "منذ 2 دقيقة", successRate: "98%" },
  { id: 2, url: "https://crm.example.com/hook", events: ["message.received"], status: "active", lastDelivery: "منذ 15 دقيقة", successRate: "100%" },
  { id: 3, url: "https://analytics.example.com/events", events: ["media.received", "template.status.updated"], status: "failing", lastDelivery: "منذ ساعة", successRate: "45%" },
];

const WebhooksPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="الويبهوكس" description="إدارة نقاط الاستقبال والأحداث">
        <Button className="gap-2"><Plus className="w-4 h-4" />إنشاء Webhook</Button>
      </PageHeader>

      <div className="space-y-4 animate-fade-in">
        {webhooks.map((wh) => (
          <div key={wh.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium font-mono" dir="ltr">{wh.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={wh.status === "active" ? "success" : "danger"} label={wh.status === "active" ? "نشط" : "فاشل"} />
                    <span className="text-xs text-muted-foreground">آخر توصيل: {wh.lastDelivery}</span>
                    <span className="text-xs text-muted-foreground">نسبة النجاح: {wh.successRate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary p-2"><Play className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>اختبار</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground p-2"><MoreHorizontal className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>خيارات</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {wh.events.map((ev) => (
                <StatusBadge key={ev} status="neutral" label={ev} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default WebhooksPage;
