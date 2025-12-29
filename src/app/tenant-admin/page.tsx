import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Page() {
  // Redirect legacy route to consolidated Settings tab
  redirect('/dashboard/settings?tab=tenant-admin')
}
