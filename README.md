# 🚢 RepoHarbor

RepoHarbor lets you **chat with a GitHub repository**.  
Provide a repo URL, the backend indexes its files, generates embeddings, and the app retrieves relevant code to answer questions about the repository.


---

## ✨ Features

- Index a public GitHub repository
- Chunk repository files and generate embeddings
- Store embeddings and metadata in MongoDB
- Retrieve relevant code snippets using vector similarity
- Ask questions about a repository through a chat interface
- Context-aware responses generated using an LLM
- Persistent conversations per repository

---

## 🏗 Architecture

```
User
 │
 ▼
Frontend (React + Vite)
 │
 │  API Requests
 ▼
Backend (Node.js + Express)
 │
 ├── GitHub API
 │     Fetch repository files
 │
 ├── Chunking + Embedding
 │     Gemini embeddings
 │
 ├── MongoDB
 │     Store:
 │     • repositories
 │     • code chunks
 │     • embeddings
 │
 └── LLM (Groq)
       Generate response using retrieved context
```

Flow:

```
Repository URL
      │
      ▼
Fetch repo files
      │
      ▼
Chunk code files
      │
      ▼
Generate embeddings
      │
      ▼
Store in MongoDB
      │
      ▼
User question
      │
      ▼
Vector search
      │
      ▼
Send context + question to LLM
      │
      ▼
Return answer
```

---

## 🧰 Tech Stack

| Layer | Tools |
|------|------|
| Frontend | React |
| Build Tool | Vite |
| Styling | TailwindCSS |
| State | Zustand |
| Backend | Node.js |
| API Framework | Express |
| Language | TypeScript |
| Database | MongoDB |
| Embeddings | Google Gemini |
| LLM | Groq |
| Repository Data | GitHub API |

---

## 📂 Repository Structure

```
repoharbor
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── index.ts
│   │
│   ├── dist
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── features
│   │   ├── layouts
│   │   ├── lib
│   │   ├── pages
│   │   ├── store
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── public
│   ├── dist
│   ├── index.html
│   └── .env
│
└── README.md
```

---

## ⚙ Environment Variables

### Backend `.env`

```
MONGO_URI=
GITHUB_TOKEN=
GROQ_API_KEY=
FRONTEND_URL=

SESSION_SECRET=
ACCESS_JWT_SECRET=
REFRESH_JWT_SECRET=

ACCESS_JWT_EXPIRATION=
REFRESH_JWT_EXPIRATION=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
```

### Frontend `.env`

```
VITE_API_URL=
```

---

## 🚀 Running Locally

Clone the repo

```
git clone https://github.com/yourusername/repoharbor.git
cd repoharbor
```

Install dependencies

Backend

```
cd backend
npm install
```

Frontend

```
cd frontend
npm install
```

Run backend

```
npm run dev
```

Run frontend

```
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🤝 Contributing

If you want to experiment or improve something, feel free to open a PR or issue.  
No strict process — just keep it clean and reasonable.

### ⚠️ Heads up: Gemini Embeddings Rate Limits

If you're running RepoHarbor locally, you'll likely hit Gemini's embedding API rate limits pretty fast (it's strict on the free tier). Instead of waiting around, swap in one of these alternatives:

- **[Nomic Embed](https://huggingface.co/nomic-ai/nomic-embed-text-v1)** — open source, strong performance, runs fully local via Ollama. Zero API calls, zero limits.
- **[Ollama](https://ollama.com/) + `mxbai-embed-large`** — pull and run embeddings locally in one command. Dead simple setup.
- **[OpenAI `text-embedding-3-small`](https://platform.openai.com/docs/guides/embeddings)** — generous free credits, easy drop-in swap, solid quality.
- **[Voyage AI](https://www.voyageai.com/)** — made for code/retrieval tasks specifically, free tier is decent for local dev.

> Swapping should be a one-liner — just match the output dimensions if you're using a vector store.
