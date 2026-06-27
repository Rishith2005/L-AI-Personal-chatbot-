# L-AI-Personal-chatbot- (L AI)

This project is an AI chatbot which acts as a personal assistant in everyday life by making your queries and problems easier to solve and understand. It is a modern, full-stack Generative AI chatbot platform built with production-grade software engineering practices.

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Frontend       | React · TypeScript · Vite · Tailwind CSS · Framer Motion |
| Backend        | FastAPI · Python 3.12+ · Uvicorn                |
| Database       | Supabase PostgreSQL                             |
| Authentication | Supabase Auth (JWT)                             |
| AI Provider    | Hugging Face — Qwen/Qwen2.5-Coder-7B-Instruct  |

## Project Structure

```
├── frontend/          # React SPA
├── backend/           # FastAPI server
└── Docs & prompts/    # Design specifications
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env       # Fill in your credentials
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # Fill in your API URL
npm run dev
```
<img width="1918" height="1031" alt="Screenshot 2026-06-27 120315" src="https://github.com/user-attachments/assets/b978518d-4de9-4983-84da-4e397a18765a" />
<img width="1918" height="1031" alt="Screenshot 2026-06-27 120610" src="https://github.com/user-attachments/assets/d106bcc0-4e7c-49c4-be81-c7156785d1bf" />
<img width="1918" height="1026" alt="Screenshot 2026-06-27 120641" src="https://github.com/user-attachments/assets/7455b440-82a1-4818-b97d-61aa4d31ba99" />
## License

Private — All rights reserved.
