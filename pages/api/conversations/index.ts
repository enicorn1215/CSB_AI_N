import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, listConversations, createConversation, hasDb } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionId = (req.query.session_id as string) || (req.body?.session_id as string);
  const prolificId = (req.query.prolific_id as string) || (req.body?.prolific_id as string) || null;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'session_id required' });
  }

  if (!hasDb()) {
    if (req.method === 'GET') return res.status(200).json([]);
    return res.status(503).json({ error: 'Server storage not configured' });
  }

  await initDb();

  if (req.method === 'GET') {
    const list = await listConversations(sessionId, prolificId);
    return res.status(200).json(
      list.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.created_at.toISOString(),
        messages: [],
      }))
    );
  }

  if (req.method === 'POST') {
    const title = (req.body?.title as string) || 'New chat';
    const version = process.env.APP_VERSION ?? (req.body?.version as string) ?? null;
    const prolificId = (req.body?.prolific_id as string) || null;
    const originUrl = (req.body?.origin_url as string) || null;
    const conv = await createConversation(sessionId, title, version, prolificId, originUrl);
    if (!conv) return res.status(500).json({ error: 'Failed to create conversation' });
    return res.status(200).json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.created_at.toISOString(),
      messages: [],
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
