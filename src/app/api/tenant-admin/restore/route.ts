
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { tenantId, data } = await req.json();
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

  // Insert tenant row if not exists
  if (data.tenant) {
    const { error } = await supabase
      .from('tenants')
      .upsert([data.tenant], { onConflict: 'id' });
    if (error) {
      return NextResponse.json({ error: `Failed to restore tenant: ${error.message}` }, { status: 500 });
    }
  }

  // Restore all tables
  const tables = [
    'documents',
    'transactions',
    'line_items',
    'bank_accounts',
    'memberships',
    'tenant_settings',
    'tenant_statistics',
    // Add more tables as needed
  ];

  for (const table of tables) {
    if (Array.isArray(data[table])) {
      for (const row of data[table]) {
        const { error } = await supabase
          .from(table)
          .upsert([row]);
        if (error) {
          return NextResponse.json({ error: `Failed to restore ${table}: ${error.message}` }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
