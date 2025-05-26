import os
import sys
import requests
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import json

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

def review_pr(repo: str):
    pr_number = get_recent_pr(repo)
    if not pr_number:
        print("No recent PRs found.")
        return
    print(f"\n=== Smart Code Review for {repo} PR #{pr_number} ===")
    files = fetch_pr_files(repo, pr_number)
    if not files:
        print("No files found or error fetching PR files.")
        return

    print(f"Found {len(files)} files to review.")
    for i, f in enumerate(files[:5], 1):
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        if not patch:
            print(f"  {i}. {filename} - No changes to review")
            continue

        print(f"  {i}. Reviewing {filename}...")
        lines = patch.splitlines()
        changes = [f"Added: {line[1:].strip()}" for line in lines if line.startswith("+") and not line.startswith("+++")]
        changes.extend([f"Removed: {line[1:].strip()}" for line in lines if line.startswith("-") and not line.startswith("---")])
        
        if not changes:
            continue

        change_summary = "\n".join(changes[:20])
        prompt = f"""Review the following code changes in file '{filename}':
{change_summary}
Provide:
1. Code quality assessment
2. Potential bugs or issues
3. Suggestions for improvement
4. Security considerations
Keep response concise and actionable."""
        
        suggestions = call_groq_api(prompt)
        print(f"\nFile: {filename}")
        print(f"Changes: {len(changes)}")
        print(f"Review:\n{suggestions}")
        print("-" * 50)

def analyze_commit(repo: str):
    commit_sha = get_recent_commit(repo)
    if not commit_sha:
        print("No recent commits found.")
        return
    print(f"\n=== Commit Intent Analysis for {commit_sha} in {repo} ===")
    commit = fetch_commit(repo, commit_sha)
    if not commit:
        print("Commit not found.")
        return

    message = commit.get("commit", {}).get("message", "")
    diff = fetch_commit_diff(repo, commit_sha)
    if not diff:
        print("Diff not found.")
        return

    if len(diff) > 2000:
        diff = diff[:2000] + "\n... (truncated)"

    prompt = f"""Analyze this commit:
Commit Message:
{message}
Code Changes:
{diff}
Evaluate PMP:
1. Does the commit message accurately describe the changes?
2. Is the commit message following good practices?
3. Are the changes focused and cohesive?
4. Suggest improvements for the commit message if needed.
Provide a rating (Good/Fair/Poor) and specific suggestions."""
    
    result = call_groq_api(prompt)
    print(f"Analysis Result:\n{result}")

def generate_docs(repo: str):
    files = get_changed_files(repo)
    if not files:
        print("No recent files found.")
        return
    print(f"\n=== AI Documentation Generator for {repo} ===")
    for i, path in enumerate(files[:3], 1):
        print(f"  {i}. Generating docs for {path}...")
        for branch in ['main', 'master']:
            raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
            try:
                resp = requests.get(raw_url, timeout=30)
                if resp.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                continue
        else:
            print(f"    ❌ Failed to fetch {path}")
            continue

        content = resp.text
        if len(content) > 3000:
            content = content[:3000] + "\n... (truncated)"

        prompt = f"""Generate comprehensive documentation for this source code file '{path}':
{content}
Provide:
1. Brief description of the file's purpose
2. Main functions/classes and their purposes
3. Usage examples if applicable
4. Dependencies and requirements
5. Any important notes for developers
Format as markdown documentation."""
        
        doc = call_groq_api(prompt)
        print(f"\nDocumentation for {path}:")
        print(doc)
        print("=" * 60)

def scan_security(repo: str):
    pr_number = get_recent_pr(repo)
    if not pr_number:
        print("No recent PRs found.")
        return
    print(f"\n=== Security Scan on PR #{pr_number} for {repo} ===")
    files = fetch_pr_files(repo, pr_number)
    if not files:
        print("No files found or error fetching PR.")
        return

    print(f"Scanning {len(files)} files for security issues...")
    for i, f in enumerate(files[:5], 1):
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        if not patch:
            print(f"  {i}. {filename} - No changes to scan")
            continue

        print(f"  {i}. Scanning {filename}...")
        added_lines = [line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++")]
        if not added_lines:
            continue

        code_sample = "\n".join(added_lines[:30])
        prompt = f"""Perform a security analysis on this code from file '{filename}':
{code_sample}
Look for:
1. SQL injection risks
2. XSS vulnerabilities
3. Authentication/authorization issues
4. Input validation problems
5. Hardcoded secrets/credentials
6. Unsafe deserialization
7. Path traversal issues
8. Command injection risks
For each issue:
- Severity (Critical/High/Medium/Low)
- Description
- Specific line or pattern
- Remediation suggestion
If no issues, state "No obvious security issues detected."
"""
        
        analysis = call_groq_api(prompt)
        print(f"\nFile: {filename}")
        print(f"Lines Scanned: {len(added_lines)}")
        print(f"Analysis:\n{analysis}")
        print("-" * 60)

def get_productivity_metrics(repo: str):
    print(f"\n=== Developer Productivity Insights for {repo} ===")
    prs = github_api_get(f"/repos/{repo}/pulls", params={"state": "all", "per_page": 50, "sort": "updated", "direction": "desc"})
    if not prs:
        print("No PRs found or error fetching PRs.")
        return

    turnaround_times = []
    total_additions = 0
    total_deletions = 0
    contributors = set()
    merged_prs = 0

    for pr in prs:
        created = pr.get("created_at")
        merged = pr.get("merged_at")
        user = pr.get("user", {}).get("login")
        if user:
            contributors.add(user)
        total_additions += pr.get("additions", 0)
        total_deletions += pr.get("deletions", 0)
        if created and merged:
            try:
                c_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                m_dt = datetime.fromisoformat(merged.replace("Z", "+00:00"))
                delta = (m_dt - c_dt).total_seconds() / 3600
                turnaround_times.append(delta)
                merged_prs += 1
            except ValueError:
                continue

    avg_turnaround = sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0
    print(f"📊 Productivity Metrics:")
    print(f"  • Average PR Turnaround Time: {avg_turnaround:.1f} hours ({avg_turnaround/24:.1f} days)")
    print(f"  • Total Merged PRs: {merged_prs}")
    print(f"  • Total Lines Added: {total_additions:,}")
    print(f"  • Total Lines Deleted: {total_deletions:,}")
    print(f"  • Net Lines Changed: {total_additions - total_deletions:,}")
    print(f"  • Unique Contributors: {len(contributors)}")
    print(f"  • Average Changes per PR: {(total_additions + total_deletions) / max(len(prs), 1):.0f}")

def main():
    print("🚀 GitHub AI Code Analyzer")
    print("=" * 40)
    print("Available features:")
    print("1: Smart Code Reviewer (analyzes most recent PR)")
    print("2: Developer Productivity Insights")
    print("3: Commit Intent Analyzer (analyzes most recent commit)")
    print("4: AI-Powered Documentation Generator (for recent files)")
    print("5: Security Scan with AI (scans most recent PR)")
    print("-" * 40)

    try:
        choice = input("Enter choice (1-5): ").strip()
        if choice not in ["1", "2", "3", "4", "5"]:
            print("❌ Invalid choice. Please select 1-5.")
            return

        repo = input("Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
            return

        if choice == "1":
            review_pr(repo)
        elif choice == "2":
            get_productivity_metrics(repo)
        elif choice == "3":
            analyze_commit(repo)
        elif choice == "4":
            generate_docs(repo)
        elif choice == "5":
            scan_security(repo)

    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    main()