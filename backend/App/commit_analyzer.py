from utils import fetch_commit, fetch_commit_diff, get_recent_commit, call_groq_api

def analyze_commit(repo: str):
    commit_sha = get_recent_commit(repo)
    if not commit_sha:
        print("❌ No recent commits found.")
        return

    print(f"\n🔍 Commit Intent Analysis for `{commit_sha}` in `{repo}`")
    commit = fetch_commit(repo, commit_sha)
    if not commit:
        print("❌ Commit not found.")
        return

    message = commit.get("commit", {}).get("message", "")
    diff = fetch_commit_diff(repo, commit_sha)
    if not diff:
        print("❌ Diff not found.")
        return

    if len(diff) > 2000:
        diff = diff[:2000] + "\n... (diff truncated due to token limit)"

    prompt = f"""Analyze this commit:
Commit Message:
{message}

Code Changes:
{diff}

Evaluate this commit:
1. Does the commit message accurately describe the changes?
2. Is the commit message following good practices?
3. Are the changes focused and cohesive?
4. Suggest improvements for the commit message if needed.

Provide a summary rating (Good/Fair/Poor) and your suggestions in plain language."""

    result = call_groq_api(prompt)
    print("\n🧠 AI Commit Analysis Result:\n")
    print(result)

if __name__ == "__main__":
    try:
        repo = input("📦 Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
        else:
            analyze_commit(repo)
    except KeyboardInterrupt:
        print("\n👋 Exiting.")
