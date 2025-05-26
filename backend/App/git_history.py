from datetime import datetime
from utils import github_api_get, call_groq_api

def fetch_commits(repo: str) -> list:
    params = {"per_page": 100}
    commits = []
    page = 1
    while True:
        part = github_api_get(f"/repos/{repo}/commits", params={**params, "page": page})
        if not part:
            break
        commits.extend(part)
        if len(part) < 100:
            break
        page += 1
    return commits

def generate_history_summary(repo: str):
    print(f"\n=== Visual Git History and Summary for {repo} ===")
    print(f"Fetching all commits in repository history...")

    commits = fetch_commits(repo)
    if not commits:
        print("No commits found in the repository.")
        return

    # Create a timeline
    print("\n📅 Commit Timeline:")
    timeline = []
    for commit in commits[:50]:  # Limit to 50 commits for display brevity
        sha = commit.get("sha", "unknown")[:7]
        date = commit.get("commit", {}).get("author", {}).get("date", "")
        message = commit.get("commit", {}).get("message", "").split("\n")[0][:100]  # Truncate long messages
        author = commit.get("commit", {}).get("author", {}).get("name", "unknown")
        if date:
            try:
                date_str = datetime.fromisoformat(date.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M")
                timeline.append(f"{date_str} | {sha} | {author}: {message}")
            except ValueError:
                continue

    for entry in sorted(timeline):
        print(f"  {entry}")

    # Generate AI summary
    commit_messages = [commit.get("commit", {}).get("message", "") for commit in commits]
    commit_summary = "\n".join([msg.split("\n")[0][:100] for msg in commit_messages[:50]])  # Limit to 50 messages
    if not commit_summary:
        print("\n📝 Repository Summary: No meaningful commit messages to summarize.")
        return

    prompt = f"""Summarize the following commit messages from the entire history of repository '{repo}':
{commit_summary}
Focus on:
1. Key features added or modified
2. Major bug fixes
3. Significant refactoring or improvements
4. Any other notable changes
Provide a concise summary (3-5 bullet points) in markdown format."""
    
    summary = call_groq_api(prompt)
    print(f"\n📝 Repository Summary (Entire History):")
    print(summary)

if __name__ == "__main__":
    repo = input("Enter GitHub repo (owner/repo): ").strip()
    if not repo or "/" not in repo:
        print("❌ Invalid repository format. Use 'owner/repo'")
    else:
        generate_history_summary(repo)