import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Auth: verify the caller is a logged-in user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  // Use service role to bypass RLS for provisioning
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get WA credentials from secrets
  const wabaId = Deno.env.get("WA_WABA_ID");
  const waLabel = Deno.env.get("META_TEST_ACCOUNT_NAME") || "حساب واتساب الرئيسي";
  const phoneNumberId = Deno.env.get("WA_PHONE_NUMBER_ID");
  const phoneNumber = Deno.env.get("WA_PHONE_NUMBER");

  if (!wabaId) {
    return json({ error: "WA_WABA_ID not configured in secrets" }, 500);
  }

  // Find the user's tenant
  const { data: membership, error: memErr } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (memErr || !membership) {
    return json({ error: "Tenant not found for user" }, 404);
  }

  const tenantId = membership.tenant_id;

  // Check if wa_account already exists for this tenant
  const { data: existing } = await supabase
    .from("wa_accounts")
    .select("id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (existing) {
    // Already provisioned — also check wa_numbers
    let provisionedNumber = null;
    if (phoneNumberId && phoneNumber) {
      const { data: existingNum } = await supabase
        .from("wa_numbers")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("phone_number_id", phoneNumberId)
        .maybeSingle();

      if (!existingNum) {
        const { data: newNum } = await supabase
          .from("wa_numbers")
          .insert({
            tenant_id: tenantId,
            wa_account_id: existing.id,
            phone_e164: phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`,
            phone_number_id: phoneNumberId,
            type: "connected",
            status: "active",
          })
          .select("id")
          .single();
        provisionedNumber = newNum;
      }
    }

    return json({ status: "already_exists", wa_account_id: existing.id, provisioned_number: provisionedNumber });
  }

  // Create wa_account
  const { data: waAccount, error: waErr } = await supabase
    .from("wa_accounts")
    .insert({
      tenant_id: tenantId,
      waba_id: wabaId,
      label: waLabel,
    })
    .select("id")
    .single();

  if (waErr || !waAccount) {
    console.error("Failed to create wa_account:", waErr);
    return json({ error: "Failed to create wa_account", details: waErr?.message }, 500);
  }

  console.log(`Created wa_account ${waAccount.id} for tenant ${tenantId}`);

  // Optionally create wa_number if phone secrets are available
  let waNumber = null;
  if (phoneNumberId && phoneNumber) {
    const { data: numData, error: numErr } = await supabase
      .from("wa_numbers")
      .insert({
        tenant_id: tenantId,
        wa_account_id: waAccount.id,
        phone_e164: phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`,
        phone_number_id: phoneNumberId,
        type: "connected",
        status: "active",
      })
      .select("id")
      .single();

    if (numErr) {
      console.error("Failed to create wa_number:", numErr);
    } else {
      waNumber = numData;
      console.log(`Created wa_number ${waNumber.id} for tenant ${tenantId}`);
    }
  }

  return json({
    status: "provisioned",
    wa_account_id: waAccount.id,
    wa_number_id: waNumber?.id ?? null,
  });
});
