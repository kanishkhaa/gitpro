# 🔍 DevAssist AI Suite

A powerful suite of developer tools that leverages LLMs to boost code quality, documentation, security, onboarding, and team productivity—all directly integrated with your GitHub workflow.

## 🚀 Features

### 1. Smart Code Reviewer
- Automatically reviews Pull Requests using LLMs.
- Highlights issues, suggests improvements, and integrates seamlessly with GitHub webhooks.

### 2. Developer Productivity Insights
- Analyze key metrics like PR turnaround time, code churn (LOC), and team contributions.
- Visualize trends with APIs powered by TimescaleDB or MongoDB.

### 3. Commit Intent Analyzer
- Verifies if commit messages align with actual code changes.
- Uses AI to suggest improved commit messages.

### 4. AI-Powered Documentation Generator
- Auto-generates docstrings and README content.
- Identifies undocumented functions/classes and comments directly on PRs.

### 5. Smart Onboarding Assistant
- Parses repo structure using AST to build interactive onboarding maps.
- Summarizes modules using LLMs and serves them as Mermaid graphs.

### 6. Security Scan with AI
- Scans changed code in PRs for potential security flaws.
- Outputs CVE-style issues with severity levels and fix suggestions.

### 7. Visual Git History
- Groups commits by date, sprint, or branch.
- Summarizes commit activity using LLMs.

---

## 🧰 Tech Stack

- **Backend**: Python (FastAPI or Flask) / Node.js
- **LLMs**: OpenAI GPT-4 / Claude / Sonar via OpenAI, Azure, or AWS Bedrock
- **Queue System**: Celery + Redis / BullMQ
- **Database**: PostgreSQL / TimescaleDB / MongoDB
- **Optional**: Qdrant for vector similarity of code embeddings

---

## 📦 Installation

```bash
git clone "https://github.com/kanishkhaa/gitpro"
cd devassist-ai-suite
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# or for Node.js version
npm install

