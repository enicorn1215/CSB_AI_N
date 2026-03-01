# CSB_0 — Version B

Copy of CSB_0 for experiment variant B. Minimal chat UI that looks like ChatGPT and uses the **OpenAI API**.

## Setup

1. **Install dependencies**
   ```bash
   cd UI_Experiment
   npm install
   ```

2. **Set your OpenAI API key**
   - Copy `.env.local.example` to `.env.local`
   - Set `OPENAI_API_KEY=sk-...`

## Run

```bash
npm run dev
```

Open **http://localhost:3000**.

## Features

- **ChatGPT-like layout**: Sidebar (New chat + conversation list), message area, input at bottom
- **OpenAI**: Uses `/api/chat` → `gpt-4o` (non-streaming)
- **Conversations**: Stored in `localStorage`; switch or start new chats from the sidebar

## Build for production

```bash
npm run build
npm start
```
