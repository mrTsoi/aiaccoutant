
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { tenantId } = await req.json();
  const supabase = await createClient();

  // Get current user and memberships
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user is SUPER_ADMIN
  const { data: isSuperAdminRaw } = await (supabase as any).rpc('is_super_admin');
  const isSuperAdmin = isSuperAdminRaw === true;

  if (!isSuperAdmin) {
    // Check if user is a member of the tenant
    const { data: membershipData, error: membershipError } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .maybeSingle();
    if (membershipError || !membershipData) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this tenant.' }, { status: 403 });
    }
  }

  // Fetch all tenant-related data
  const tables = [
    'tenants',
    'documents',
    'transactions',
    'line_items',
    'bank_accounts',
    'memberships',
    'tenant_settings',
    'tenant_statistics',
    // Add more tables as needed
  ];

  const backup: Record<string, any[]> = {};
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('tenant_id', tenantId);
    if (error) {
      return NextResponse.json({ error: `Failed to fetch ${table}: ${error.message}` }, { status: 500 });
    }
    backup[table] = data || [];
  }

  // Also fetch the tenant row itself
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();
  if (tenantError) {
    return NextResponse.json({ error: `Failed to fetch tenant: ${tenantError.message}` }, { status: 500 });
  }
  backup['tenant'] = tenantData;

  return NextResponse.json({ data: backup });
}
