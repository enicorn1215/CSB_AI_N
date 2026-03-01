import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, appendMessages, updateConversationTitle, hasDb } from '../../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string;
  const { session_id: sessionId, messages: bodyMessages, title, prolific_id: prolificId } = req.body as {
    session_id?: string;
    messages?: { role: string; content: string; timestamp: string }[];
    title?: string;
    prolific_id?: string;
  };

  if (!id || !sessionId) {
    return res.status(400).json({ error: 'id and session_id required' });
  }

  if (!hasDb()) {
    return res.status(503).json({ error: 'Server storage not configured' });
  }

  await initDb();

  if (title !== undefined && typeof title === 'string') {
    await updateConversationTitle(id, sessionId, title, prolificId ?? null);
  }

  if (Array.isArray(bodyMessages) && bodyMessages.length > 0) {
    const ok = await appendMessages(id, sessionId, bodyMessages, prolificId ?? null);
    if (!ok) return res.status(404).json({ error: 'Conversation not found' });
  }

  return res.status(200).json({ ok: true });
}
