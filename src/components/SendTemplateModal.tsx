import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  template: any;
  tenantId: string;
}

export function SendTemplateModal({ open, onClose, template, tenantId }: Props) {
  const { toast } = useToast();

  const [contacts, setContacts] = useState<any[]>([]);
  const [waNumbers, setWaNumbers] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedWaNumber, setSelectedWaNumber] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadData = async () => {
    if (loaded) return;
    const [{ data: c }, { data: n }] = await Promise.all([
      supabase.from("contacts").select("id,phone_e164,display_name").eq("tenant_id", tenantId).limit(200),
      supabase.from("wa_numbers").select("id,phone_e164").eq("tenant_id", tenantId).limit(20),
    ]);
    setContacts(c || []);
    setWaNumbers(n || []);
    if (n && n.length > 0) setSelectedWaNumber(n[0].id);
    setLoaded(true);

    // Pre-fill variables from template
    const vars: Record<string, string> = {};
    const varList = Array.isArray(template?.variables) ? template.variables : [];
    varList.forEach((_: any, i: number) => { vars[String(i + 1)] = ""; });
    // Also extract {{N}} from body
    const bodyVars = (template?.body || "").match(/\{\{(\d+)\}\}/g) || [];
    bodyVars.forEach((v: string) => {
      const key = v.replace(/[{}]/g, "");
      if (!vars[key]) vars[key] = "";
    });
    setVariables(vars);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) loadData();
    else {
      setSelectedContact("");
      setVariables({});
      setLoaded(false);
      onClose();
    }
  };

  const handleSend = async () => {
    if (!selectedContact || !selectedWaNumber || !template) return;
    setSending(true);

    // Find or create conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("wa_number_id", selectedWaNumber)
      .eq("contact_id", selectedContact)
      .eq("status", "open")
      .maybeSingle();

    let conversationId = existing?.id;

    if (!conversationId) {
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({ tenant_id: tenantId, wa_number_id: selectedWaNumber, contact_id: selectedContact, status: "open" })
        .select("id").single();

      if (convErr) {
        toast({ title: "خطأ في إنشاء المحادثة", description: convErr.message, variant: "destructive" });
        setSending(false);
        return;
      }
      conversationId = newConv.id;
    }

    // Build template payload for WhatsApp
    const componentParams = Object.entries(variables)
      .sort(([a], [b]) => Number(a) - Number(b))
      .filter(([, v]) => v.trim() !== "")
      .map(([, value]) => ({ type: "text", text: value }));

    const templatePayload: any = {
      name: template.name,
      language: { code: template.language || "ar" },
    };

    if (componentParams.length > 0) {
      templatePayload.components = [{ type: "body", parameters: componentParams }];
    }

    const { data: result, error } = await supabase.functions.invoke("send_message", {
      body: {
        tenant_id: tenantId,
        conversation_id: conversationId,
        template: templatePayload,
      },
    });

    setSending(false);
    if (error || result?.error) {
      toast({ title: "فشل الإرسال", description: error?.message || result?.error, variant: "destructive" });
    } else {
      toast({ title: "✓ تم إرسال القالب بنجاح" });
      handleOpenChange(false);
    }
  };

  const varKeys = Object.keys(variables).sort((a, b) => Number(a) - Number(b));
  const bodyPreview = (template?.body || "").replace(/\{\{(\d+)\}\}/g, (_: string, k: string) =>
    variables[k] ? `**${variables[k]}**` : `{{${k}}}`
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إرسال قالب: {template?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Preview */}
          {template?.body && (
            <div className="bg-muted/40 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1.5">معاينة القالب</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" dir={template.language?.startsWith("ar") ? "rtl" : "ltr"}>
                {bodyPreview}
              </p>
            </div>
          )}

          {/* Recipient */}
          <div className="space-y-1.5">
            <Label>جهة الاتصال المستلمة</Label>
            <Select value={selectedContact} onValueChange={setSelectedContact}>
              <SelectTrigger>
                <SelectValue placeholder="اختر جهة اتصال..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span>{c.display_name || c.phone_e164}</span>
                    <span className="text-muted-foreground text-xs mr-2" dir="ltr">{c.phone_e164}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sender number */}
          <div className="space-y-1.5">
            <Label>رقم واتساب المرسِل</Label>
            <Select value={selectedWaNumber} onValueChange={setSelectedWaNumber}>
              <SelectTrigger>
                <SelectValue placeholder="اختر رقم..." />
              </SelectTrigger>
              <SelectContent>
                {waNumbers.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    <span dir="ltr">{n.phone_e164}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variables */}
          {varKeys.length > 0 && (
            <div className="space-y-2">
              <Label>متغيرات القالب</Label>
              <div className="space-y-2">
                {varKeys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded border border-border w-12 text-center shrink-0">
                      {`{{${key}}}`}
                    </span>
                    <Input
                      placeholder={`قيمة المتغير ${key}`}
                      value={variables[key]}
                      onChange={(e) => setVariables(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>إلغاء</Button>
          <Button
            onClick={handleSend}
            disabled={!selectedContact || !selectedWaNumber || sending}
            className="gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            إرسال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
