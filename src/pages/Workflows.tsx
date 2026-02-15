import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, GitBranch, Play, Pause, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const workflows = [
  { id: 1, name: "الرد التلقائي - ساعات العمل", trigger: "message.received", action: "رد تلقائي", status: "active", runs: 1247, lastRun: "منذ 3 دقائق" },
  { id: 2, name: "تعيين المحادثات الجديدة", trigger: "message.received", action: "تعيين مسؤول", status: "active", runs: 892, lastRun: "منذ 10 دقائق" },
  { id: 3, name: "تنبيه فشل الإرسال", trigger: "message.failed", action: "إعادة محاولة + تنبيه", status: "paused", runs: 45, lastRun: "منذ يومين" },
];

const WorkflowsPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="سير العمل" description="إنشاء وإدارة قواعد الأتمتة">
        <Button className="gap-2"><Plus className="w-4 h-4" />سير عمل جديد</Button>
      </PageHeader>

      <div className="space-y-4 animate-fade-in">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{wf.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">الحدث: {wf.trigger} → الإجراء: {wf.action}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={wf.status === "active" ? "success" : "warning"} label={wf.status === "active" ? "نشط" : "متوقف"} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground p-1">
                      {wf.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{wf.status === "active" ? "إيقاف" : "تشغيل"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>خيارات</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>عدد التشغيلات: {wf.runs.toLocaleString("ar")}</span>
              <span>آخر تشغيل: {wf.lastRun}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default WorkflowsPage;
