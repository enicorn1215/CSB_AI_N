import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, getConversation, hasDb } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.id as string;
  const sessionId = req.query.session_id as string;
  const prolificId = (req.query.prolific_id as string) || null;
  if (!id || !sessionId) {
    return res.status(400).json({ error: 'id and session_id required' });
  }

  if (!hasDb()) {
    return res.status(503).json({ error: 'Server storage not configured' });
  }

  await initDb();
  const conv = await getConversation(id, sessionId, prolificId);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  return res.status(200).json({
    id: conv.id,
    title: conv.title,
    createdAt: conv.created_at.toISOString(),
    messages: conv.messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp).toISOString(),
    })),
  });
}
