// Shared domain types derived from Supabase enums — no more `as any`
import type { Database } from "@/integrations/supabase/types";

export type MsgDirection  = Database["public"]["Enums"]["msg_direction"];
export type MsgStatus     = Database["public"]["Enums"]["msg_status"];
export type ConvStatus    = Database["public"]["Enums"]["conv_status"];
export type MediaKind     = Database["public"]["Enums"]["media_kind"];
export type TmplCategory  = Database["public"]["Enums"]["tmpl_category"];
export type TmplStatus    = Database["public"]["Enums"]["tmpl_status"];
export type MemberRole    = Database["public"]["Enums"]["member_role"];
export type WaNumberType  = Database["public"]["Enums"]["wa_number_type"];

// Row helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Message      = Tables<"messages">;
export type Conversation = Tables<"conversations">;
export type Contact      = Tables<"contacts">;
export type WaNumber     = Tables<"wa_numbers">;
export type WaAccount    = Tables<"wa_accounts">;
export type Template     = Tables<"templates">;
export type MediaFile    = Tables<"media_files">;
export type Workflow     = Tables<"workflows">;
export type AuditLog     = Tables<"audit_logs">;
export type ApiKey       = Tables<"api_keys">;
export type WebhookEndpoint = Tables<"webhook_endpoints">;
