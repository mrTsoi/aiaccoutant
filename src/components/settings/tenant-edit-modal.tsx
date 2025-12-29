"use client";

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { CurrencySelect } from '@/components/ui/currency-select'
import { LocaleSelect } from '@/components/ui/locale-select'
import { toast } from 'sonner'
import { useTenant, useUserRole } from '@/hooks/use-tenant'
import { useLiterals } from '@/hooks/use-literals'

type Tenant = {
  id: string
  name: string
  slug: string
  locale?: string
  currency?: string
}

export default function TenantEditModal({ tenant, open, onOpenChange, onSaved }: { tenant: Tenant | null, open: boolean, onOpenChange: (open: boolean) => void, onSaved?: () => void }) {
  const lt = useLiterals()
  const { refreshTenants, isSuperAdmin } = useTenant()
  const userRole = useUserRole()
  const canEdit = isSuperAdmin || userRole === 'COMPANY_ADMIN' || userRole === 'SUPER_ADMIN'

  const [formData, setFormData] = useState({ name: '', slug: '', locale: 'en-US', currency: 'USD' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (tenant) {
      setFormData({ name: tenant.name || '', slug: tenant.slug || '', locale: tenant.locale || 'en-US', currency: tenant.currency || 'USD' })
    }
  }, [tenant])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!tenant) return
    if (!canEdit) return toast.error(lt('Permission denied'))

    try {
      setSaving(true)
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant.id, name: formData.name, locale: formData.locale, currency: formData.currency }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || lt('Failed to save settings'))
      await refreshTenants()
      toast.success(lt('Settings saved successfully'))
      onOpenChange(false)
      if (onSaved) onSaved()
    } catch (err: any) {
      console.error(err)
      toast.error(lt('Failed to save settings: {message}', { message: err.message }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lt('Edit Company')}</DialogTitle>
          <DialogDescription>{lt('Edit tenant company settings.')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{lt('Company Name')}</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!canEdit} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">{lt('URL Slug')}</Label>
            <Input id="slug" value={formData.slug} disabled className="bg-gray-100" />
            <p className="text-xs text-muted-foreground">{lt('The URL slug cannot be changed.')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="locale">{lt('Locale / Region')}</Label>
              <LocaleSelect value={formData.locale} onChange={(v) => setFormData({ ...formData, locale: v })} disabled={!canEdit} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">{lt('Base Currency')}</Label>
              <CurrencySelect value={formData.currency} onChange={(v) => setFormData({ ...formData, currency: v })} disabled={!canEdit} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">{lt('Cancel')}</Button>
            {canEdit && (
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {lt('Save Changes')}
              </Button>
            )}
          </div>
        </form>

        <DialogClose />
      </DialogContent>
    </Dialog>
  )
}
