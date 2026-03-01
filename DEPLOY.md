# Deploy CSB_0_VersionB on Render via GitHub

Follow these steps to deploy the ideation app to Render using your GitHub repo **CSB_AI_D**.

**GitHub repo:** **CSB_AI_D**

---

## Step 1: Connect your code to GitHub

Choose one way to get the app (CSB_0_VersionB) into the **CSB_AI_D** repo.

**Option A — Use the Cursor folder as the repo (one place to work)**  
Work only in the Cursor project folder; push it to GitHub from there. In a terminal:

```bash
cd "/Users/xinhui/Library/Mobile Documents/com~apple~CloudDocs/Cursor/CSB_0_VersionB"

# If this folder is not yet a git repo:
git init
git add .
git commit -m "Deploy CSB_0_VersionB ideation app"

# Point at your GitHub repo and push
git remote add origin https://github.com/enicorn1215/CSB_AI_D.git
git branch -M main
git push -u origin main
```

If the repo **CSB_AI_D** already has commits (e.g. a README), you may need to pull first: `git pull origin main --allow-unrelated-histories`, then fix any conflicts, then `git push -u origin main`. Or, if you are okay replacing the repo content: `git push -u origin main --force` (use with care).

**Option B — Use your existing clone in Documents**  
Copy everything from **CSB_0_VersionB** (Cursor) into `/Users/xinhui/Documents/GitHub/CSB_AI_D` (no `node_modules` or `.next`). Then run:

```bash
cd /Users/xinhui/Documents/GitHub/CSB_AI_D
git add .
git commit -m "Deploy CSB_0_VersionB ideation app"
git push origin main
```

(Use `master` instead of `main` if that’s your default branch.)

If GitHub asks for authentication, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) as the password, or complete sign-in in the browser if prompted.

---

## Step 3: Create a Web Service on Render

1. Go to [render.com](https://render.com) and sign in (e.g. with GitHub).
2. In the **Dashboard**, click **New +** → **Web Service**.
3. **Connect the repo:** select your GitHub account, then choose **CSB_AI_D**. Click **Connect**.
4. Use these settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `CSB_AI_D` (or any name) |
   | **Region** | e.g. Oregon |
   | **Branch** | `main` |
   | **Root Directory** | Leave **blank** |
   | **Runtime** | **Node** |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |

5. **Environment variables:** open **Environment** (or Advanced) and add:

   | Key | Value |
   |-----|--------|
   | `OPENAI_API_KEY` | Your OpenAI API key (same as in `.env.local`; never commit it). |
   | `DATABASE_URL` | (Optional) Internal Database URL from a Render PostgreSQL service (see below). |
   | `NODE_VERSION` | (Optional) `20` to pin Node version. |

6. **Database (recommended for storing conversations and submissions):**
   - In the Render dashboard, click **New +** → **PostgreSQL**. Create a free database.
   - Open the new database and copy the **Internal Database URL**.
   - In your **Web Service** → **Environment**, add:
     - **Key:** `DATABASE_URL`
     - **Value:** paste the Internal Database URL.
   - Redeploy the Web Service so it uses the database.

7. Click **Create Web Service**. Wait until the status is **Live**.
8. Open the URL Render shows (e.g. `https://csb-ai-d.onrender.com`). Test the app: proceed past the intro, chat, and submit an idea to confirm the flow and Qualtrics redirect.

---

## Checklist

- [ ] Code connected to GitHub: either **Option A** (push from Cursor folder) or **Option B** (push from Documents/GitHub/CSB_AI_D).
- [ ] `git push` to **CSB_AI_D** completed.
- [ ] Render Web Service created; connected to repo **CSB_AI_D**; Node; Build = `npm install && npm run build`, Start = `npm start`.
- [ ] `OPENAI_API_KEY` set in Render Environment.
- [ ] (Optional) PostgreSQL created and `DATABASE_URL` set.
- [ ] Deploy is Live and the app URL works.

---

## After deploy

- **Updates:** Change code, then `git add .` → `git commit -m "..."` → `git push`. Render will auto-deploy.
- **Env changes:** Render dashboard → your service → **Environment** → edit variables → Save (triggers redeploy).
- **Free tier:** The service may spin down after ~15 min of no traffic; the first request after that can be slow (cold start).
