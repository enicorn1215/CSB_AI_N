import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const p = getPool();
  if (!p) return;
  await p.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      content TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_session ON submissions(session_id);
  `);
}

export type DbConversation = { id: string; title: string; created_at: Date };
export type DbMessage = { role: string; content: string; timestamp: Date };

export async function listConversations(sessionId: string): Promise<DbConversation[]> {
  const p = getPool();
  if (!p) return [];
  const r = await p.query<DbConversation>(
    'SELECT id, title, created_at FROM conversations WHERE session_id = $1 ORDER BY created_at DESC',
    [sessionId]
  );
  return r.rows.map((row) => ({
    id: row.id,
    title: row.title,
    created_at: row.created_at,
  }));
}

export async function createConversation(
  sessionId: string,
  title: string
): Promise<{ id: string; title: string; created_at: Date } | null> {
  const p = getPool();
  if (!p) return null;
  const r = await p.query<{ id: string; title: string; created_at: Date }>(
    'INSERT INTO conversations (session_id, title) VALUES ($1, $2) RETURNING id, title, created_at',
    [sessionId, title]
  );
  if (r.rows.length === 0) return null;
  return r.rows[0];
}

export async function getConversation(
  conversationId: string,
  sessionId: string
): Promise<{ id: string; title: string; created_at: Date; messages: DbMessage[] } | null> {
  const p = getPool();
  if (!p) return null;
  const conv = await p.query<{ id: string; title: string; created_at: Date }>(
    'SELECT id, title, created_at FROM conversations WHERE id = $1 AND session_id = $2',
    [conversationId, sessionId]
  );
  if (conv.rows.length === 0) return null;
  const msgs = await p.query<DbMessage>(
    'SELECT role, content, timestamp FROM messages WHERE conversation_id = $1 ORDER BY id',
    [conversationId]
  );
  return {
    ...conv.rows[0],
    messages: msgs.rows,
  };
}

export async function appendMessages(
  conversationId: string,
  sessionId: string,
  messages: { role: string; content: string; timestamp: string }[]
): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  const check = await p.query(
    'SELECT 1 FROM conversations WHERE id = $1 AND session_id = $2',
    [conversationId, sessionId]
  );
  if (check.rows.length === 0) return false;
  for (const m of messages) {
    await p.query(
      'INSERT INTO messages (conversation_id, role, content, timestamp) VALUES ($1, $2, $3, $4::timestamptz)',
      [conversationId, m.role, m.content, m.timestamp]
    );
  }
  return true;
}

export async function updateConversationTitle(
  conversationId: string,
  sessionId: string,
  title: string
): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  const r = await p.query(
    'UPDATE conversations SET title = $1 WHERE id = $2 AND session_id = $3',
    [title, conversationId, sessionId]
  );
  return (r.rowCount ?? 0) > 0;
}

export function hasDb(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function createSubmission(
  sessionId: string,
  content: string
): Promise<{ id: string; submitted_at: Date } | null> {
  const p = getPool();
  if (!p) return null;
  const r = await p.query<{ id: string; submitted_at: Date }>(
    'INSERT INTO submissions (session_id, content) VALUES ($1, $2) RETURNING id, submitted_at',
    [sessionId, content]
  );
  if (r.rows.length === 0) return null;
  return r.rows[0];
}

export async function getSubmissionBySession(
  sessionId: string
): Promise<{ id: string; content: string; submitted_at: Date } | null> {
  const p = getPool();
  if (!p) return null;
  const r = await p.query<{ id: string; content: string; submitted_at: Date }>(
    'SELECT id, content, submitted_at FROM submissions WHERE session_id = $1 ORDER BY submitted_at DESC LIMIT 1',
    [sessionId]
  );
  if (r.rows.length === 0) return null;
  return r.rows[0];
}
