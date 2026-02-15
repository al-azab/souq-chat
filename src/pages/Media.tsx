import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Search, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";

const kindLabel: Record<string, string> = {
  image: "صورة",
  video: "فيديو",
  document: "مستند",
  audio: "صوت",
  sticker: "ملصق",
  other: "أخرى",
};

const kindColor: Record<string, "info" | "success" | "warning" | "neutral"> = {
  image: "info",
  video: "success",
  document: "warning",
  audio: "neutral",
  sticker: "info",
  other: "neutral",
};

const MediaPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState("all");

  useEffect(() => {
    if (!tenantId) return;
    let query = supabase
      .from("media_files")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("received_at", { ascending: false });
    if (kindFilter !== "all") query = query.eq("kind", kindFilter as any);
    query.limit(100).then(({ data }) => {
      setMediaFiles(data || []);
      setLoading(false);
    });
  }, [tenantId, kindFilter]);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (tenantLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="الوسائط" description="إدارة الملفات والوسائط المستلمة" />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Select value={kindFilter} onValueChange={setKindFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="النوع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="image">صور</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
            <SelectItem value="document">مستند</SelectItem>
            <SelectItem value="audio">صوت</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mediaFiles.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState icon={ImageIcon} title="لا توجد وسائط" description="ستظهر الوسائط هنا عند استقبال ملفات عبر واتساب" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">النوع</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">MIME</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحجم</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">مفتاح التخزين</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ الاستلام</th>
              </tr>
            </thead>
            <tbody>
              {mediaFiles.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4"><StatusBadge status={kindColor[item.kind] || "neutral"} label={kindLabel[item.kind] || item.kind} /></td>
                  <td className="p-4 text-sm text-muted-foreground font-mono text-xs" dir="ltr">{item.mime || "—"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{formatSize(item.size_bytes)}</td>
                  <td className="p-4 text-sm text-muted-foreground font-mono text-xs max-w-xs truncate" dir="ltr">{item.storage_key || "قيد المعالجة"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(item.received_at).toLocaleDateString("ar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MediaPage;
