import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TenantInfo {
  tenantId: string | null;
  tenantName: string | null;
  role: string | null;
  loading: boolean;
}

export function useTenant(): TenantInfo {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTenantId(null);
      setTenantName(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchTenant = async () => {
      const { data: membership } = await supabase
        .from("tenant_members")
        .select("tenant_id, role, tenants(name)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership) {
        setTenantId(membership.tenant_id);
        setRole(membership.role);
        // @ts-ignore - nested join
        setTenantName(membership.tenants?.name || null);
      }
      setLoading(false);
    };

    fetchTenant();
  }, [user]);

  return { tenantId, tenantName, role, loading };
}
