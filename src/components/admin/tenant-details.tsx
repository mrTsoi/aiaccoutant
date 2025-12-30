'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useLiterals } from '@/hooks/use-literals'

export default function TenantDetails({ tenantId, onClose, onSaved }: { tenantId: string; onClose: () => void; onSaved?: () => void }) {
  const lt = useLiterals()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/tenants?tenant_id=${encodeURIComponent(tenantId)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || lt('status.load_failed'))
        const tenant = json.tenant || json
        if (mounted) setForm(tenant)
      } catch (e: any) {
        console.error(e)
        toast.error(e?.message || lt('status.load_failed'))
        onClose()
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [tenantId, lt, onClose])

  if (loading || !form) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded shadow">{lt('Loading...')}</div>
      </div>
    )
  }

  const set = (k: string, v: any) => setForm({ ...form, [k]: v })

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        tenant_id: form.id || form.tenant_id || tenantId,
        name: form.name,
        locale: form.locale,
        currency: form.currency,
        company_address: form.company_address,
        company_type: form.company_type,
        company_telephone: form.company_telephone,
        company_email: form.company_email,
        shareholders: Array.isArray(form.shareholders) ? form.shareholders : (typeof form.shareholders === 'string' ? form.shareholders.split(',').map((s:string)=>s.trim()).filter(Boolean) : []),
        directors: Array.isArray(form.directors) ? form.directors : (typeof form.directors === 'string' ? form.directors.split(',').map((s:string)=>s.trim()).filter(Boolean) : []),
        year_end_date: form.year_end_date,
        first_year_of_engagement: form.first_year_of_engagement ? Number(form.first_year_of_engagement) : undefined,
        business_registration_number: form.business_registration_number,
        certificate_of_incorporation_number: form.certificate_of_incorporation_number,
        billing_method: form.billing_method,
        first_contact_person: form.first_contact_person,
        first_contact_name: form.first_contact_name,
        first_contact_telephone: form.first_contact_telephone,
        first_contact_mobile: form.first_contact_mobile,
        first_contact_email: form.first_contact_email,
        second_contact_person: form.second_contact_person,
        second_contact_name: form.second_contact_name,
        second_contact_telephone: form.second_contact_telephone,
        second_contact_mobile: form.second_contact_mobile,
        second_contact_email: form.second_contact_email,
      }

      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || lt('status.save_failed'))
      toast.success(lt('status.saved'))
      if (onSaved) onSaved()
      onClose()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || lt('status.save_failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <div className="text-sm text-gray-500">{form.slug}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>{lt('Close')}</Button>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <Card>
              <CardHeader>
                <CardTitle>{lt('tenant.company_profile.title')}</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <section aria-labelledby="company-info">
                    <h4 id="company-info" className="text-sm font-medium text-gray-700">{lt('tenant.company_profile.company_info')}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                        <Label>{lt('tenant.company_profile.name')}</Label>
                      <Input value={form.name || ''} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.type')}</Label>
                      <select className="w-full px-3 py-2 border rounded-md" value={form.company_type || ''} onChange={e => set('company_type', e.target.value)}>
                          <option value="">--</option>
                        <option value="Limited Company">Limited Company</option>
                        <option value="Sole proprietor">Sole proprietor</option>
                        <option value="Partnership">Partnership</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                        <Label>{lt('tenant.company_profile.address')}</Label>
                      <Textarea value={form.company_address || ''} onChange={e => set('company_address', e.target.value)} rows={3} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.telephone')}</Label>
                      <Input value={form.company_telephone || ''} onChange={e => set('company_telephone', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.email')}</Label>
                      <Input value={form.company_email || ''} onChange={e => set('company_email', e.target.value)} />
                    </div>
                  </div>
                </section>

                <section aria-labelledby="registry-financial">
                    <h4 id="registry-financial" className="text-sm font-medium text-gray-700">{lt('tenant.company_profile.registry_financial')}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                        <Label>{lt('tenant.company_profile.br_number')}</Label>
                      <Input value={form.business_registration_number || ''} onChange={e => set('business_registration_number', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.ci_number')}</Label>
                      <Input value={form.certificate_of_incorporation_number || ''} onChange={e => set('certificate_of_incorporation_number', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.year_end_date')}</Label>
                      <Input type="date" value={form.year_end_date || ''} onChange={e => set('year_end_date', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.first_year_of_engagement')}</Label>
                      <Input type="number" value={form.first_year_of_engagement || ''} onChange={e => set('first_year_of_engagement', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <Label>{lt('tenant.company_profile.billing_method')}</Label>
                      <Input value={form.billing_method || ''} onChange={e => set('billing_method', e.target.value)} />
                    </div>
                  </div>
                </section>

                <section aria-labelledby="people">
                    <h4 id="people" className="text-sm font-medium text-gray-700">{lt('tenant.company_profile.people')}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Label>{lt('tenant.company_profile.shareholders')}</Label>
                      <Input value={(form.shareholders || []).join ? (form.shareholders || []).join(', ') : (form.shareholders || '')} onChange={e => set('shareholders', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <Label>{lt('tenant.company_profile.directors')}</Label>
                      <Input value={(form.directors || []).join ? (form.directors || []).join(', ') : (form.directors || '')} onChange={e => set('directors', e.target.value)} />
                    </div>
                  </div>
                </section>

                <section aria-labelledby="contacts">
                    <h4 id="contacts" className="text-sm font-medium text-gray-700">{lt('tenant.company_profile.primary_contacts')}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                        <Label>{lt('tenant.company_profile.first_contact_name')}</Label>
                      <Input value={form.first_contact_name || ''} onChange={e => set('first_contact_name', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.first_contact_telephone')}</Label>
                      <Input value={form.first_contact_telephone || ''} onChange={e => set('first_contact_telephone', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.first_contact_mobile')}</Label>
                      <Input value={form.first_contact_mobile || ''} onChange={e => set('first_contact_mobile', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.first_contact_email')}</Label>
                      <Input value={form.first_contact_email || ''} onChange={e => set('first_contact_email', e.target.value)} />
                    </div>

                    <div>
                        <Label>{lt('tenant.company_profile.second_contact_name')}</Label>
                      <Input value={form.second_contact_name || ''} onChange={e => set('second_contact_name', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.second_contact_telephone')}</Label>
                      <Input value={form.second_contact_telephone || ''} onChange={e => set('second_contact_telephone', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.second_contact_mobile')}</Label>
                      <Input value={form.second_contact_mobile || ''} onChange={e => set('second_contact_mobile', e.target.value)} />
                    </div>
                    <div>
                        <Label>{lt('tenant.company_profile.second_contact_email')}</Label>
                      <Input value={form.second_contact_email || ''} onChange={e => set('second_contact_email', e.target.value)} />
                    </div>
                  </div>
                </section>

                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose}>{lt('actions.cancel')}</Button>
                    <Button onClick={handleSave} disabled={saving}>{saving ? lt('actions.saving') : lt('actions.save_changes')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
