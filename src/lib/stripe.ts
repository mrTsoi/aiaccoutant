import Stripe from 'stripe'
import { createServiceClient } from './supabase/service'

export async function getStripeConfig() {
  // Allow overriding Stripe config from environment for tests/local runs
  const envConfig = process.env.STRIPE_CONFIG_JSON || process.env.STRIPE_CONFIG
  if (envConfig) {
    try {
      const parsed = JSON.parse(envConfig)
      return parsed as {
        mode: 'test' | 'live'
        publishable_key: string
        secret_key: string
        webhook_secret: string
      }
    } catch (e) {
      // fall through to env vars below or DB
    }
  }

  // Fallback to individual env vars
  if (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_WEBHOOK_SECRET) {
    return {
      mode: (process.env.STRIPE_MODE as 'test' | 'live') || 'test',
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secret_key: process.env.STRIPE_SECRET_KEY || '',
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('system_settings')
    .select('setting_value')
    .eq('setting_key', 'stripe_config')
    .single()

  if (error || !data) {
    throw new Error('Stripe configuration not found')
  }

  const settingValue = (data as unknown as { setting_value: unknown }).setting_value

  return settingValue as unknown as {
    mode: 'test' | 'live'
    publishable_key: string
    secret_key: string
    webhook_secret: string
  }
}

export async function getStripe() {
  const config = await getStripeConfig()

  if (!config.secret_key) {
    throw new Error('Stripe secret key not configured')
  }

  return new Stripe(config.secret_key, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
  })
}

// Helper: retrieve subscription (supports stripe-mock via STRIPE_USE_MOCK + STRIPE_API_BASE_URL)
export async function retrieveSubscription(subscriptionId: string) {
  const config = await getStripeConfig()
  if (process.env.STRIPE_USE_MOCK === 'true' && process.env.STRIPE_API_BASE_URL) {
    const base = process.env.STRIPE_API_BASE_URL.replace(/\/$/, '')
    const url = `${base}/v1/subscriptions/${encodeURIComponent(subscriptionId)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${config.secret_key}` } })
    if (!res.ok) throw new Error('Failed to retrieve subscription from mock: ' + await res.text())
    return res.json()
  }

  const stripe = await getStripe()
  return stripe.subscriptions.retrieve(String(subscriptionId))
}

// Helper: retrieve invoice (supports stripe-mock via STRIPE_USE_MOCK + STRIPE_API_BASE_URL)
export async function retrieveInvoice(invoiceId: string) {
  const config = await getStripeConfig()
  if (process.env.STRIPE_USE_MOCK === 'true' && process.env.STRIPE_API_BASE_URL) {
    const base = process.env.STRIPE_API_BASE_URL.replace(/\/$/, '')
    const url = `${base}/v1/invoices/${encodeURIComponent(invoiceId)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${config.secret_key}` } })
    if (!res.ok) throw new Error('Failed to retrieve invoice from mock: ' + await res.text())
    return res.json()
  }

  const stripe = await getStripe()
  return stripe.invoices.retrieve(String(invoiceId))
}
