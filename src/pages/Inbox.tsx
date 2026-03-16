import { useEffect, useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Send, Loader2, Plus, MessageSquare, X, Clock, CheckCircle2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";
import { FileAttachmentButton } from "@/components/inbox/FileAttachmentButton";
import { ChatMediaBubble } from "@/components/inbox/ChatMediaBubble";
import { MessageStatus } from "@/components/inbox/MessageStatus";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Message, Conversation, Contact, WaNumber, ConvStatus } from "@/lib/types";

/* ─── Types ─── */
type ConvWithRels = Conversation & {
  contacts: Pick<Contact, "id" | "phone_e164" | "display_name"> | null;
  wa_numbers: Pick<WaNumber, "phone_e164"> | null;
};

type PendingFile = { url: string; mime: string; filename: string };

const CONV_STATUS_MAP: Record<ConvStatus, { badge: "success" | "warning" | "neutral"; label: string }> = {
  open:    { badge: "success", label: "مفتوح" },
  pending: { badge: "warning", label: "معلق" },
  closed:  { badge: "neutral", label: "مغلق" },
};

/* ─── Helpers ─── */
function initials(name?: string | null, phone?: string | null): string {
  return (name || phone || "?").charAt(0).toUpperCase();
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}

function fmtDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return fmtTime(iso);
  return d.toLocaleDateString("ar", { month: "short", day: "numeric" });
}

/* ═══════════════════════════════════════════════ */
const InboxPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const { toast } = useToast();

  /* Conversations */
  const [conversations, setConversations]   = useState<ConvWithRels[]>([]);
  const [convsLoading, setConvsLoading]      = useState(true);
  const [convSearch, setConvSearch]          = useState("");
  const [statusFilter, setStatusFilter]      = useState<"all" | ConvStatus>("all");

  /* Active conversation */
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [msgLoading, setMsgLoading]         = useState(false);
  const messagesEndRef                       = useRef<HTMLDivElement>(null);

  /* Compose */
  const [newMsg, setNewMsg]         = useState("");
  const [sending, setSending]       = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);

  /* New conversation dialog */
  const [newConvOpen, setNewConvOpen]         = useState(false);
  const [dlgContacts, setDlgContacts]         = useState<Pick<Contact, "id" | "phone_e164" | "display_name">[]>([]);
  const [dlgNumbers, setDlgNumbers]           = useState<Pick<WaNumber, "id" | "phone_e164" | "phone_number_id">[]>([]);
  const [dlgContact, setDlgContact]           = useState("");
  const [dlgNumber, setDlgNumber]             = useState("");
  const [dlgContactSearch, setDlgContactSearch] = useState("");
  const [creatingConv, setCreatingConv]       = useState(false);

  /* ── Fetch conversations ── */
  const fetchConversations = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, status, last_message_at, assigned_to, contact_id, wa_number_id, created_at, contacts(id, phone_e164, display_name), wa_numbers(phone_e164)")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(80);
    setConversations((data ?? []) as ConvWithRels[]);
    setConvsLoading(false);
  }, [tenantId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  /* ── Fetch messages for selected conversation ── */
  useEffect(() => {
    if (!selectedConvId) { setMessages([]); return; }
    setMsgLoading(true);
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", selectedConvId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        setMessages((data ?? []) as Message[]);
        setMsgLoading(false);
      });
  }, [selectedConvId]);

  /* Auto-scroll to bottom when new messages arrive */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Realtime: messages INSERT + UPDATE ── */
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel("inbox-rt")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.conversation_id === selectedConvId) {
          setMessages((prev) => {
            // Deduplicate by id
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        // Refresh conversation list to update last_message_at + ordering
        fetchConversations();
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        const updated = payload.new as Message;
        if (updated.conversation_id === selectedConvId) {
          setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId, selectedConvId, fetchConversations]);

  /* ── Load dialog data ── */
  useEffect(() => {
    if (!newConvOpen || !tenantId) return;
    Promise.all([
      supabase.from("contacts").select("id, phone_e164, display_name").eq("tenant_id", tenantId).order("display_name").limit(500),
      supabase.from("wa_numbers").select("id, phone_e164, phone_number_id").eq("tenant_id", tenantId).eq("status", "active").limit(20),
    ]).then(([{ data: c }, { data: n }]) => {
      setDlgContacts((c ?? []) as typeof dlgContacts);
      setDlgNumbers((n ?? []) as typeof dlgNumbers);
      if (n?.length) setDlgNumber(n[0].id);
    });
  }, [newConvOpen, tenantId]);

  /* ── Create conversation ── */
  const handleCreateConversation = async () => {
    if (!dlgContact || !dlgNumber || !tenantId) return;
    setCreatingConv(true);

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("wa_number_id", dlgNumber)
      .eq("contact_id", dlgContact)
      .eq("status", "open")
      .maybeSingle();

    if (existing) {
      setSelectedConvId(existing.id);
      setNewConvOpen(false);
      setCreatingConv(false);
      return;
    }

    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ tenant_id: tenantId, wa_number_id: dlgNumber, contact_id: dlgContact, status: "open" })
      .select("id")
      .single();

    setCreatingConv(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    await fetchConversations();
    setSelectedConvId(newConv.id);
    setNewConvOpen(false);
    setDlgContact("");
    setDlgContactSearch("");
  };

  /* ── Close conversation ── */
  const handleCloseConv = async () => {
    if (!selectedConvId || !tenantId) return;
    const { error } = await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", selectedConvId)
      .eq("tenant_id", tenantId);
    if (!error) {
      fetchConversations();
      toast({ title: "تم إغلاق المحادثة" });
    }
  };

  /* ── Send message ── */
  const handleSend = async () => {
    if (!selectedConvId || (!newMsg.trim() && !pendingFile) || !tenantId) return;
    setSending(true);

    const payload: Record<string, unknown> = {
      tenant_id: tenantId,
      conversation_id: selectedConvId,
    };

    if (pendingFile) {
      payload.media_url      = pendingFile.url;
      payload.media_mime     = pendingFile.mime;
      payload.media_filename = pendingFile.filename;
      if (newMsg.trim()) payload.caption = newMsg;
    } else {
      payload.text = newMsg;
    }

    const { error } = await supabase.functions.invoke("send_message", { body: payload });
    setSending(false);
    if (error) {
      toast({ title: "خطأ في الإرسال", description: error.message, variant: "destructive" });
    } else {
      setNewMsg("");
      setPendingFile(null);
    }
  };

  /* ── Derived data ── */
  const selectedConvData = conversations.find((c) => c.id === selectedConvId);
  const contact = selectedConvData?.contacts;

  const filteredConvs = conversations.filter((c) => {
    const ct = c.contacts;
    const matchesSearch = !convSearch
      || ct?.phone_e164?.includes(convSearch)
      || ct?.display_name?.toLowerCase().includes(convSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDlgContacts = dlgContacts.filter((c) =>
    !dlgContactSearch
    || c.display_name?.toLowerCase().includes(dlgContactSearch.toLowerCase())
    || c.phone_e164.includes(dlgContactSearch)
  );

  /* ─────────────────────── RENDER ─────────────────────── */
  if (tenantLoading || convsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3rem)] -m-6 animate-fade-in">

        {/* ═══ LEFT PANEL — Conversations list ═══ */}
        <div className="w-80 border-l border-border bg-card flex flex-col shrink-0">

          {/* Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                صندوق الوارد
                <span className="text-muted-foreground font-normal mr-1">({conversations.length})</span>
              </h2>
              <Button size="sm" onClick={() => setNewConvOpen(true)} className="h-7 gap-1 text-xs">
                <Plus className="w-3 h-3" /> جديد
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pr-8 h-8 text-xs"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
              />
            </div>

            {/* Status filter pills */}
            <div className="flex gap-1">
              {(["all", "open", "pending", "closed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {s === "all" ? "الكل" : s === "open" ? "مفتوح" : s === "pending" ? "معلق" : "مغلق"}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  {convSearch || statusFilter !== "all" ? "لا توجد نتائج" : "لا توجد محادثات"}
                </p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const ct = conv.contacts;
                const isSelected = conv.id === selectedConvId;
                const st = CONV_STATUS_MAP[conv.status as ConvStatus] ?? CONV_STATUS_MAP.closed;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 border-b border-border cursor-pointer transition-colors hover:bg-muted/40 ${
                      isSelected ? "bg-primary/5 border-r-2 border-r-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {initials(ct?.display_name, ct?.phone_e164)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold truncate">
                            {ct?.display_name || ct?.phone_e164 || "مجهول"}
                          </p>
                          {conv.last_message_at && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {fmtDay(conv.last_message_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5" dir="ltr">
                          {ct?.phone_e164}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5 flex justify-end">
                      <StatusBadge status={st.badge} label={st.label} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Chat area ═══ */}
        <div className="flex-1 flex flex-col bg-background min-w-0">

          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="اختر محادثة"
                description="اختر محادثة من القائمة أو ابدأ محادثة جديدة"
                actionLabel="محادثة جديدة"
                onAction={() => setNewConvOpen(true)}
              />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-card shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {initials(contact?.display_name, contact?.phone_e164)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {contact?.display_name || "جهة اتصال"}
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{contact?.phone_e164}</p>
                </div>
                {/* Conv status badge + close button */}
                <div className="flex items-center gap-2">
                  {selectedConvData && (
                    <StatusBadge
                      status={CONV_STATUS_MAP[selectedConvData.status as ConvStatus]?.badge ?? "neutral"}
                      label={CONV_STATUS_MAP[selectedConvData.status as ConvStatus]?.label ?? selectedConvData.status}
                    />
                  )}
                  {selectedConvData?.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={handleCloseConv}
                    >
                      <X className="w-3 h-3" /> إغلاق
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-10">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد رسائل بعد — ابدأ المحادثة
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mediaMeta = (msg.meta as Record<string, unknown>)?.media as Record<string, unknown> | undefined;
                    const isOutbound = msg.direction === "outbound";
                    const hasMedia = mediaMeta && (
                      mediaMeta.url || mediaMeta.storage_key ||
                      mediaMeta.media_file_id || mediaMeta.id
                    );
                    return (
                      <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                        {/* Inbound avatar */}
                        {!isOutbound && (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-bold shrink-0 ml-1.5 mt-auto mb-1">
                            {initials(contact?.display_name, contact?.phone_e164)}
                          </div>
                        )}

                        <div className={`max-w-[68%] rounded-2xl px-3.5 py-2.5 ${
                          isOutbound
                            ? "bg-primary text-primary-foreground rounded-bl-sm"
                            : "bg-card border border-border rounded-br-sm shadow-sm"
                        }`}>
                          {hasMedia && (
                            <div className="mb-1.5">
                              <ChatMediaBubble media={mediaMeta as Parameters<typeof ChatMediaBubble>[0]["media"]} isOutbound={isOutbound} />
                            </div>
                          )}
                          {msg.text && !(mediaMeta && msg.text === `[${(mediaMeta as any).type}]`) && (
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          )}
                          <div className={`flex items-center gap-0.5 mt-1 ${isOutbound ? "justify-end" : "justify-start"}`}>
                            <span className={`text-[10px] ${isOutbound ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {fmtTime(msg.created_at)}
                            </span>
                            <MessageStatus status={msg.status} isOutbound={isOutbound} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose bar */}
              <div className="px-4 py-3 border-t border-border bg-card shrink-0">
                {pendingFile && (
                  <div className="mb-2">
                    <FileAttachmentButton
                      tenantId={tenantId!}
                      onFileReady={setPendingFile}
                      onClear={() => setPendingFile(null)}
                      pendingFile={pendingFile}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {!pendingFile && (
                    <FileAttachmentButton
                      tenantId={tenantId!}
                      onFileReady={setPendingFile}
                      onClear={() => setPendingFile(null)}
                      pendingFile={null}
                    />
                  )}
                  <Input
                    placeholder={pendingFile ? "أضف تعليقاً (اختياري)..." : "اكتب رسالة..."}
                    className="flex-1"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || (!newMsg.trim() && !pendingFile)}
                    className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ New Conversation Dialog ═══ */}
      <Dialog open={newConvOpen} onOpenChange={(v) => { setNewConvOpen(v); if (!v) { setDlgContact(""); setDlgContactSearch(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>محادثة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>رقم واتساب المرسِل</Label>
              <Select value={dlgNumber} onValueChange={setDlgNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر رقم..." />
                </SelectTrigger>
                <SelectContent>
                  {dlgNumbers.length === 0
                    ? <div className="px-3 py-2 text-sm text-muted-foreground">لا توجد أرقام — أضف رقمًا من صفحة الأرقام أولاً</div>
                    : dlgNumbers.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        <span dir="ltr">{n.phone_e164}</span>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>جهة الاتصال</Label>
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="ابحث..."
                  className="pr-8 h-8 text-sm mb-1.5"
                  value={dlgContactSearch}
                  onChange={(e) => setDlgContactSearch(e.target.value)}
                />
              </div>
              <Select value={dlgContact} onValueChange={setDlgContact}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر جهة اتصال..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {filteredDlgContacts.length === 0
                    ? <div className="px-3 py-2 text-sm text-muted-foreground">لا توجد نتائج</div>
                    : filteredDlgContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="font-medium">{c.display_name || c.phone_e164}</span>
                        {c.display_name && (
                          <span className="text-muted-foreground text-xs mr-1.5" dir="ltr">{c.phone_e164}</span>
                        )}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewConvOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!dlgContact || !dlgNumber || creatingConv}
            >
              {creatingConv && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              فتح محادثة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InboxPage;
