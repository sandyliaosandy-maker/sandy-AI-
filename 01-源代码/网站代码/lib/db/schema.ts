/**
 * 数据库 Schema 定义
 * 
 * 用于定义数据库表结构
 * 注意：实际数据库表需要通过迁移脚本创建
 */

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  email_verified: Date | null
  created_at: Date
  updated_at: Date
}

export interface Account {
  id: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

export interface Session {
  id: string
  session_token: string
  user_id: string
  expires: Date
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
  plan_type: 'monthly' | 'yearly'
  current_period_start: Date | null
  current_period_end: Date | null
  cancel_at_period_end: boolean
  created_at: Date
  updated_at: Date
}

export interface ContentAccessLog {
  id: string
  user_id: string | null
  content_type: 'news' | 'note' | 'newsletter'
  content_slug: string
  access_type: 'preview' | 'full'
  accessed_at: Date
}
