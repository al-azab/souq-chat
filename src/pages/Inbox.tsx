import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";

const InboxPage = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchConversations = async () => {
    if (!tenantId) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, status, last_message_at, assigned_to, contacts(id, phone_e164, display_name), wa_numbers(phone_e164)")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);
    setConversations(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, [tenantId]);

  useEffect(() => {
    if (!selectedConv) { setMessages([]); return; }
    setMsgLoading(true);
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", selectedConv)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        setMessages(data || []);
        setMsgLoading(false);
      });
  }, [selectedConv]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel("inbox-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `tenant_id=eq.${tenantId}` }, (payload) => {
        if (payload.new.conversation_id === selectedConv) {
          setMessages((prev) => [...prev, payload.new]);
        }
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId, selectedConv]);

  const handleSend = async () => {
    if (!selectedConv || !newMsg.trim() || !tenantId) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("send_message", {
      body: { tenant_id: tenantId, conversation_id: selectedConv, text: newMsg },
    });
    setSending(false);
    if (error) {
      toast({ title: "خطأ في الإرسال", description: error.message, variant: "destructive" });
    } else {
      setNewMsg("");
    }
  };

  const selectedConvData = conversations.find((c) => c.id === selectedConv);
  const contact = selectedConvData?.contacts;

  const filteredConversations = search
    ? conversations.filter((c) => {
        const ct = c.contacts;
        return ct?.phone_e164?.includes(search) || ct?.display_name?.includes(search);
      })
    : conversations;

  if (tenantLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3rem)] -m-6 animate-fade-in">
        {/* Conversations List */}
        <div className="w-80 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">صندوق الوارد ({conversations.length})</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث..." className="pr-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">لا توجد محادثات</div>
            ) : (
              filteredConversations.map((conv) => {
                const ct = conv.contacts;
                const isSelected = conv.id === selectedConv;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {(ct?.display_name || ct?.phone_e164 || "?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{ct?.display_name || ct?.phone_e164}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">{ct?.phone_e164}</p>
                      </div>
                      <StatusBadge status={conv.status === "open" ? "success" : conv.status === "pending" ? "warning" : "neutral"} label={conv.status === "open" ? "مفتوح" : conv.status === "pending" ? "معلق" : "مغلق"} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="اختر محادثة" description="اختر محادثة من القائمة لعرض الرسائل" />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {(contact?.display_name || contact?.phone_e164 || "?").charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{contact?.display_name || "جهة اتصال"}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{contact?.phone_e164}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">لا توجد رسائل بعد</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.direction === "outbound"
                          ? "bg-card border border-border rounded-br-sm"
                          : "bg-primary text-primary-foreground rounded-bl-sm"
                      }`}>
                        <p className="text-sm">{msg.text || "(وسائط)"}</p>
                        <p className={`text-[10px] mt-1 ${msg.direction === "outbound" ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="اكتب رسالة..."
                    className="flex-1"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMsg.trim()}
                    className="bg-primary text-primary-foreground p-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InboxPage;
