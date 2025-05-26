import os
import sys
import requests
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Validate environment variables
print("GitHub Token:", "Set" if GITHUB_TOKEN else "Not Set")
print("GROQ API Key:", "Set" if GROQ_API_KEY else "Not Set")

if not GITHUB_TOKEN:
    print("WARNING: GITHUB_TOKEN env var not set. You may face rate limiting.")
if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY env var not set. Exiting.")
    sys.exit(1)

# GitHub API settings
GITHUB_API_URL = "https://api.github.com"
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
    "Accept": "application/vnd.github.v3+json"
}

def call_groq_api(prompt: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.2
    }
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=30)
        if resp.status_code == 200:
            return resp.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        else:
            print(f"Groq API Error: {resp.status_code} {resp.text}")
            return f"API Error: {resp.status_code}"
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return f"Request Error: {str(e)}"

def github_api_get(endpoint: str, params=None):
    url = f"{GITHUB_API_URL}{endpoint}"
    clean_headers = {k: v for k, v in HEADERS.items() if v}
    try:
        resp = requests.get(url, headers=clean_headers, params=params, timeout=30)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            print(f"GitHub API: Resource not found - {endpoint}")
            return None
        else:
            print(f"GitHub API Error ({resp.status_code}): {resp.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"GitHub API Request error: {e}")
        return None

def fetch_pr_files(repo: str, pr_number: int) -> List[dict]:
    files = []
    page = 1
    while True:
        part = github_api_get(f"/repos/{repo}/pulls/{pr_number}/files", params={"page": page, "per_page": 100})
        if not part:
            break
        files.extend(part)
        if len(part) < 100:
            break
        page += 1
    return files

def fetch_commit(repo: str, sha: str) -> Optional[dict]:
    return github_api_get(f"/repos/{repo}/commits/{sha}")

def fetch_commit_diff(repo: str, sha: str) -> Optional[str]:
    url = f"{GITHUB_API_URL}/repos/{repo}/commits/{sha}"
    headers = dict(HEADERS)
    headers["Accept"] = "application/vnd.github.v3.diff"
    clean_headers = {k: v for k, v in headers.items() if v}
    try:
        resp = requests.get(url, headers=clean_headers, timeout=30)
        if resp.status_code == 200:
            return resp.text
        else:
            print(f"Failed to get diff for commit {sha}: {resp.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching diff: {e}")
        return None

def get_recent_pr(repo: str) -> Optional[int]:
    prs = github_api_get(f"/repos/{repo}/pulls", params={"state": "all", "per_page": 1, "sort": "updated", "direction": "desc"})
    if prs and len(prs) > 0:
        return prs[0].get("number")
    return None

def get_recent_commit(repo: str) -> Optional[str]:
    commits = github_api_get(f"/repos/{repo}/commits", params={"per_page": 1})
    if commits and len(commits) > 0:
        return commits[0].get("sha")
    return None

def get_changed_files(repo: str) -> List[str]:
    commits = github_api_get(f"/repos/{repo}/commits", params={"per_page": 10})
    files = set()
    if commits:
        for commit in commits[:3]:
            commit_data = fetch_commit(repo, commit["sha"])
            if commit_data and "files" in commit_data:
                for file in commit_data["files"]:
                    files.add(file["filename"])
    return list(files)