import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Copy, RotateCcw, Eye, EyeOff, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const apiKeys = [
  { id: 1, name: "مفتاح الإنتاج", prefix: "wba_prod_****", scopes: ["read:inbox", "write:messages", "read:media"], status: "active", lastUsed: "منذ 5 دقائق", created: "2024-01-15" },
  { id: 2, name: "مفتاح التطوير", prefix: "wba_dev_****", scopes: ["read:inbox", "read:media"], status: "active", lastUsed: "منذ 3 ساعات", created: "2024-02-20" },
  { id: 3, name: "مفتاح التقارير", prefix: "wba_rpt_****", scopes: ["read:inbox"], status: "disabled", lastUsed: "منذ أسبوع", created: "2024-03-01" },
];

const ApiKeysPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="مفاتيح API" description="إدارة مفاتيح الوصول وصلاحياتها">
        <Button className="gap-2"><Plus className="w-4 h-4" />إنشاء مفتاح جديد</Button>
      </PageHeader>

      <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-4 text-sm text-accent-foreground animate-fade-in">
        <strong>⚠️ تنبيه أمني:</strong> المفتاح يُعرض مرة واحدة فقط عند الإنشاء. احتفظ به في مكان آمن.
      </div>

      <div className="space-y-4 animate-fade-in">
        {apiKeys.map((key) => (
          <div key={key.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{key.name}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5" dir="ltr">{key.prefix}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={key.status === "active" ? "success" : "neutral"} label={key.status === "active" ? "نشط" : "معطل"} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground p-1"><Copy className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>نسخ</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground p-1"><RotateCcw className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>تدوير المفتاح</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <span>آخر استخدام: {key.lastUsed}</span>
              <span>تاريخ الإنشاء: {key.created}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {key.scopes.map((scope) => (
                <StatusBadge key={scope} status="info" label={scope} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
