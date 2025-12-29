import { redirect } from 'next/navigation'

export default async function TenantAdminDashboardLocaleWrapper({ params }: { params: { locale: string } }) {
  // Redirect localized legacy route to the consolidated settings tab
  const { locale } = await params
  redirect(`/${locale}/dashboard/settings?tab=tenant-admin`)
}
