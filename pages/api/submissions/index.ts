import type { NextApiRequest, NextApiResponse } from 'next';
import {
  initDb,
  createSubmission,
  getSubmissionBySession,
  hasDb,
} from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionId = (req.query.session_id as string) || (req.body?.session_id as string);
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'session_id required' });
  }

  if (!hasDb()) {
    return res.status(503).json({ error: 'Server storage not configured' });
  }

  await initDb();

  if (req.method === 'GET') {
    const submission = await getSubmissionBySession(sessionId);
    if (!submission) return res.status(200).json({ submitted: false });
    return res.status(200).json({
      submitted: true,
      id: submission.id,
      content: submission.content,
      submittedAt: submission.submitted_at.toISOString(),
    });
  }

  if (req.method === 'POST') {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) {
      return res.status(400).json({ error: 'content required' });
    }
    const row = await createSubmission(sessionId, content);
    if (!row) return res.status(500).json({ error: 'Failed to save submission' });
    return res.status(200).json({
      id: row.id,
      submittedAt: row.submitted_at.toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
