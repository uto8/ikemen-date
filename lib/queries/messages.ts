import { createServerSupabaseClient } from '../supabase/server'

export type Message = {
  id: string
  senderId: string | null
  content: string
  isRead: boolean
  createdAt: string
}

type MessageRow = {
  id: string
  sender_id: string | null
  content: string
  is_read: boolean
  created_at: string
}

export function transformMessages(rows: MessageRow[]): Message[] {
  return rows.map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    content: row.content,
    isRead: row.is_read,
    createdAt: row.created_at,
  }))
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, is_read, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return transformMessages(data as MessageRow[])
}
