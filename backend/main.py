import os
import sys
import requests
import subprocess
import tempfile
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()  # Loads .env variables into environment

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print("GitHub Token:", "Set" if GITHUB_TOKEN else "Not Set")
print("GROQ API Key:", "Set" if GROQ_API_KEY else "Not Set")

if not GITHUB_TOKEN:
    print("WARNING: GITHUB_TOKEN env var not set. You may face GitHub API rate limiting.")

if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY env var not set. This is required for AI features.")
    sys.exit(1)

# GitHub API basics
GITHUB_API_URL = "https://api.github.com"

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
    "Accept": "application/vnd.github.v3+json"
}

def call_groq_api(prompt: str) -> str:
    """Calls the Groq API with the correct endpoint and format."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "llama3-8b-8192",  # Using available Groq model
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.2
    }
    
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=30)
        if resp.status_code == 200:
            j = resp.json()
            return j.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        else:
            print(f"Error from Groq API: {resp.status_code} {resp.text}")
            return f"API Error: {resp.status_code}"
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return f"Request Error: {str(e)}"

def github_api_get(endpoint: str, params=None):
    """Make GET request to GitHub API with error handling."""
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

def fetch_pr_files(repo: str, pr_number: int) -> List[Dict[str, Any]]:
    """Fetch files changed in a PR."""
    files = []
    page = 1
    while True:
        part = github_api_get(f"/repos/{repo}/pulls/{pr_number}/files", 
                            params={"page": page, "per_page": 100})
        if not part:
            break
        files.extend(part)
        if len(part) < 100:
            break
        page += 1
    return files

def fetch_pr_metadata(repo: str, pr_number: int) -> Optional[Dict[str, Any]]:
    """Fetch PR metadata."""
    return github_api_get(f"/repos/{repo}/pulls/{pr_number}")

def fetch_commit(repo: str, sha: str) -> Optional[Dict[str, Any]]:
    """Fetch commit information."""
    return github_api_get(f"/repos/{repo}/commits/{sha}")

def fetch_commit_diff(repo: str, sha: str) -> Optional[str]:
    """Fetch commit diff in patch format."""
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

def smart_code_reviewer(repo: str, pr_number: int) -> None:
    """Feature 1: Smart Code Reviewer"""
    print(f"\n=== Smart Code Review for {repo} PR #{pr_number} ===")

    files = fetch_pr_files(repo, pr_number)
    if not files:
        print("No files found or error fetching PR files.")
        return

    print(f"Found {len(files)} files to review.")
    reviews = []
    
    for i, f in enumerate(files[:5], 1):  # Limit to 5 files to avoid API limits
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        
        if not patch:
            print(f"  {i}. {filename} - No changes to review")
            continue
            
        print(f"  {i}. Reviewing {filename}...")
        
        # Extract meaningful changes
        lines = patch.splitlines()
        changes = []
        for line in lines:
            if line.startswith("+") and not line.startswith("+++"):
                changes.append(f"Added: {line[1:].strip()}")
            elif line.startswith("-") and not line.startswith("---"):
                changes.append(f"Removed: {line[1:].strip()}")
        
        if not changes:
            continue
            
        change_summary = "\n".join(changes[:20])  # Limit lines to review
        prompt = f"""Review the following code changes in file '{filename}':

{change_summary}

Please provide:
1. Code quality assessment
2. Potential bugs or issues
3. Suggestions for improvement
4. Security considerations

Keep response concise and actionable."""

        suggestions = call_groq_api(prompt)
        reviews.append({
            "file": filename, 
            "suggestions": suggestions,
            "changes_count": len(changes)
        })

    print("\n=== Review Results ===")
    for review in reviews:
        print(f"\nFile: {review['file']}")
        print(f"Changes: {review['changes_count']}")
        print(f"Review:\n{review['suggestions']}")
        print("-" * 50)

def developer_productivity_insights(repo: str) -> None:
    """Feature 2: Developer Productivity Insights"""
    print(f"\n=== Developer Productivity Insights for {repo} ===")
    
    # Fetch recent PRs
    prs = github_api_get(f"/repos/{repo}/pulls", 
                        params={"state": "all", "per_page": 50, "sort": "updated", "direction": "desc"})
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
        closed = pr.get("closed_at")
        user = pr.get("user", {}).get("login")
        
        if user:
            contributors.add(user)
        
        total_additions += pr.get("additions", 0)
        total_deletions += pr.get("deletions", 0)
        
        if created and merged:
            try:
                c_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                m_dt = datetime.fromisoformat(merged.replace("Z", "+00:00"))
                delta = (m_dt - c_dt).total_seconds() / 3600  # hours
                turnaround_times.append(delta)
                merged_prs += 1
            except ValueError:
                continue

    avg_turnaround = sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0
    
    print(f"📊 Productivity Metrics:")
    print(f"  • Average PR turnaround time: {avg_turnaround:.1f} hours ({avg_turnaround/24:.1f} days)")
    print(f"  • Total merged PRs: {merged_prs}")
    print(f"  • Total lines added: {total_additions:,}")
    print(f"  • Total lines deleted: {total_deletions:,}")
    print(f"  • Net lines change: {total_additions - total_deletions:,}")
    print(f"  • Unique contributors: {len(contributors)}")
    print(f"  • Average changes per PR: {(total_additions + total_deletions) / max(len(prs), 1):.0f}")

def commit_intent_analyzer(repo: str, commit_sha: str) -> None:
    """Feature 3: Commit Intent Analyzer"""
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
    
    # Truncate diff if too long
    if len(diff) > 2000:
        diff = diff[:2000] + "\n... (truncated)"
    
    prompt = f"""Analyze this commit:

Commit Message:
{message}

Code Changes:
{diff}

Please evaluate:
1. Does the commit message accurately describe the changes?
2. Is the commit message following good practices?
3. Are the changes focused and cohesive?
4. Suggest improvements for the commit message if needed.

Provide a rating (Good/Fair/Poor) and specific suggestions."""

    result = call_groq_api(prompt)
    print(f"Analysis Result:\n{result}")

def ai_powered_documentation_generator(repo: str, file_paths: List[str]) -> None:
    """Feature 4: AI-Powered Documentation Generator"""
    print(f"\n=== AI Documentation Generator for {repo} ===")
    
    docs = {}
    for i, path in enumerate(file_paths[:3], 1):  # Limit to 3 files
        print(f"  {i}. Generating docs for {path}...")
        
        # Try main branch first, then master
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
        if len(content) > 3000:  # Truncate large files
            content = content[:3000] + "\n... (truncated)"
        
        prompt = f"""Generate comprehensive documentation for this source code file '{path}':

{content}

Please provide:
1. Brief description of the file's purpose
2. Main functions/classes and their purposes
3. Usage examples if applicable
4. Dependencies and requirements
5. Any important notes for developers

Format as markdown documentation."""

        doc = call_groq_api(prompt)
        docs[path] = doc
        print(f"    ✅ Documentation generated")

    print("\n=== Generated Documentation ===")
    for path, doc in docs.items():
        print(f"\n## Documentation for {path}")
        print(doc)
        print("\n" + "="*60)

def smart_onboarding_assistant(repo: str) -> None:
    """Feature 5: Smart Onboarding Assistant"""
    print(f"\n=== Onboarding Assistant for {repo} ===")
    
    # Get repository information
    repo_info = github_api_get(f"/repos/{repo}")
    if repo_info:
        print(f"📁 Repository: {repo_info.get('full_name')}")
        print(f"📝 Description: {repo_info.get('description', 'No description')}")
        print(f"🏷️  Language: {repo_info.get('language', 'Unknown')}")
        print(f"⭐ Stars: {repo_info.get('stargazers_count', 0)}")
        print(f"🍴 Forks: {repo_info.get('forks_count', 0)}")
    
    # Get repo tree
    tree_resp = github_api_get(f"/repos/{repo}/git/trees/main?recursive=1")
    if not tree_resp:
        # Try master branch
        tree_resp = github_api_get(f"/repos/{repo}/git/trees/master?recursive=1")
    
    if not tree_resp:
        print("Failed to get repository structure")
        return
    
    tree = tree_resp.get("tree", [])
    
    # Categorize files
    categories = {
        "config": [".env", ".gitignore", "package.json", "requirements.txt", "setup.py", "Dockerfile"],
        "docs": ["README", "CHANGELOG", "LICENSE", "CONTRIBUTING"],
        "source": [".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs"],
        "tests": ["test_", "_test.", "spec.", ".test."]
    }
    
    file_structure = defaultdict(list)
    
    for item in tree:
        path = item.get("path", "")
        if item.get("type") == "blob":  # It's a file
            categorized = False
            for category, patterns in categories.items():
                if any(pattern in path.lower() for pattern in patterns):
                    file_structure[category].append(path)
                    categorized = True
                    break
            if not categorized:
                file_structure["other"].append(path)
    
    print(f"\n📊 Repository Structure:")
    for category, files in file_structure.items():
        if files:
            print(f"  {category.title()}: {len(files)} files")
            # Show first few files as examples
            for file in files[:3]:
                print(f"    • {file}")
            if len(files) > 3:
                print(f"    ... and {len(files) - 3} more")
    
    # Generate onboarding guide
    structure_summary = "\n".join([f"{cat}: {len(files)} files" for cat, files in file_structure.items() if files])
    
    prompt = f"""Create a developer onboarding guide for the repository '{repo}' with this structure:

{structure_summary}

Key files found:
- Config files: {', '.join(file_structure['config'][:5])}
- Documentation: {', '.join(file_structure['docs'][:5])}
- Source files: {len(file_structure['source'])} files
- Test files: {len(file_structure['tests'])} files

Please provide:
1. Quick start guide for new developers
2. Key files to understand first
3. Development setup steps
4. Testing approach
5. Contribution workflow

Keep it practical and actionable."""

    guide = call_groq_api(prompt)
    print(f"\n📚 Onboarding Guide:\n{guide}")

def security_scan_with_ai(repo: str, pr_number: int) -> None:
    """Feature 6: Security Scan with AI"""
    print(f"\n=== Security Scan on PR #{pr_number} for {repo} ===")
    
    files = fetch_pr_files(repo, pr_number)
    if not files:
        print("No files found or error fetching PR.")
        return

    print(f"Scanning {len(files)} files for security issues...")
    results = []
    
    for i, f in enumerate(files[:5], 1):  # Limit to avoid API limits
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        
        if not patch:
            continue
            
        print(f"  {i}. Scanning {filename}...")
        
        # Extract added lines (potential vulnerabilities)
        added_lines = []
        for line in patch.splitlines():
            if line.startswith("+") and not line.startswith("+++"):
                added_lines.append(line[1:])
        
        if not added_lines:
            continue
            
        code_sample = "\n".join(added_lines[:30])  # Limit for API
        
        prompt = f"""Perform a security analysis on this code from file '{filename}':

{code_sample}

Look for common security vulnerabilities:
1. SQL injection risks
2. XSS vulnerabilities
3. Authentication/authorization issues
4. Input validation problems
5. Hardcoded secrets/credentials
6. Unsafe deserialization
7. Path traversal issues
8. Command injection risks

For each issue found, provide:
- Severity (Critical/High/Medium/Low)
- Description of the vulnerability
- Specific line or pattern causing the issue
- Remediation suggestion

If no issues found, state "No obvious security issues detected."""

        analysis = call_groq_api(prompt)
        results.append({
            "file": filename, 
            "issues": analysis,
            "lines_scanned": len(added_lines)
        })

    print("\n=== Security Scan Results ===")
    for result in results:
        print(f"\nFile: {result['file']}")
        print(f"Lines scanned: {result['lines_scanned']}")
        print(f"Analysis:\n{result['issues']}")
        print("-" * 60)

def visual_git_history(repo: str, range_spec: str) -> None:
    """Feature 7: Visual Git History"""
    print(f"\n=== Git History Analysis for {repo} ===")
    
    # Fetch recent commits
    params = {"sha": "main", "per_page": 50}
    commits = github_api_get(f"/repos/{repo}/commits", params=params)
    
    if not commits:
        # Try master branch
        params["sha"] = "master"
        commits = github_api_get(f"/repos/{repo}/commits", params=params)
    
    if not commits:
        print("Failed to fetch commit history")
        return

    print(f"Analyzing {len(commits)} recent commits...")
    
    # Group commits by date
    commits_by_date = defaultdict(list)
    authors = defaultdict(int)
    
    for c in commits:
        commit_info = c.get("commit", {})
        author_info = commit_info.get("author", {})
        date = author_info.get("date", "")
        message = commit_info.get("message", "")
        author = author_info.get("name", "Unknown")
        
        if date:
            date_only = date.split("T")[0]
            commits_by_date[date_only].append({
                "message": message.split("\n")[0],  # First line only
                "author": author
            })
            authors[author] += 1

    print(f"\n📈 Commit Activity Summary:")
    print(f"  • Date range: {min(commits_by_date.keys())} to {max(commits_by_date.keys())}")
    print(f"  • Most active authors:")
    for author, count in sorted(authors.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"    - {author}: {count} commits")

    # Summarize recent activity
    recent_dates = sorted(commits_by_date.keys(), reverse=True)[:7]  # Last week
    recent_activity = []
    
    for date in recent_dates:
        day_commits = commits_by_date[date]
        messages = [c["message"] for c in day_commits]
        activity_summary = f"{date}: {len(day_commits)} commits"
        recent_activity.append(f"{activity_summary}\n  " + "\n  ".join(messages[:3]))
        if len(messages) > 3:
            recent_activity.append(f"  ... and {len(messages) - 3} more commits")

    prompt = f"""Analyze this recent git activity for repository '{repo}':

{chr(10).join(recent_activity)}

Please provide:
1. Development activity summary
2. Main areas of focus based on commit messages
3. Development patterns or trends
4. Team collaboration insights
5. Recommendations for the development process

Keep the analysis concise and actionable."""

    summary = call_groq_api(prompt)
    print(f"\n📊 Activity Analysis:\n{summary}")

def main():
    print("🚀 GitHub AI Code Analyzer")
    print("=" * 40)
    print("Available features:")
    print("1: Smart Code Reviewer")
    print("2: Developer Productivity Insights")
    print("3: Commit Intent Analyzer")
    print("4: AI-Powered Documentation Generator")
    print("5: Smart Onboarding Assistant")
    print("6: Security Scan with AI")
    print("7: Visual Git History")
    print("-" * 40)
    
    try:
        choice = input("Enter choice (1-7): ").strip()
        repo = input("Enter GitHub repo (owner/repo): ").strip()
        
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
            return

        if choice == "1":
            pr_num = int(input("Enter PR number: "))
            smart_code_reviewer(repo, pr_num)
        elif choice == "2":
            developer_productivity_insights(repo)
        elif choice == "3":
            sha = input("Enter commit SHA: ").strip()
            commit_intent_analyzer(repo, sha)
        elif choice == "4":
            files_csv = input("Enter comma-separated file paths (relative to repo root): ")
            files = [f.strip() for f in files_csv.split(",") if f.strip()]
            if not files:
                print("❌ No files specified")
                return
            ai_powered_documentation_generator(repo, files)
        elif choice == "5":
            smart_onboarding_assistant(repo)
        elif choice == "6":
            pr_num = int(input("Enter PR number: "))
            security_scan_with_ai(repo, pr_num)
        elif choice == "7":
            range_spec = input("Enter commit range (optional, press Enter for recent): ").strip()
            visual_git_history(repo, range_spec)
        else:
            print("❌ Invalid choice. Please select 1-7.")
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except ValueError as e:
        print(f"❌ Invalid input: {e}")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    main()