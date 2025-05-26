from utils import fetch_pr_files, get_recent_pr, call_groq_api, github_api_get

def review_pr_by_number(repo: str, pr_number: int):
    print(f"\n=== Reviewing PR #{pr_number} ===")
    files = fetch_pr_files(repo, pr_number)
    if not files:
        print("❌ No files found or error fetching PR files.")
        return

    print(f"✅ Found {len(files)} files to review.\n")
    for i, f in enumerate(files[:5], 1):
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        if not patch:
            print(f"  {i}. {filename} - ⚠️ No changes to review")
            continue

        print(f"  {i}. Reviewing {filename}...")

        lines = patch.splitlines()
        changes = [
            f"Added: {line[1:].strip()}" for line in lines
            if line.startswith("+") and not line.startswith("+++")
        ]
        changes.extend([
            f"Removed: {line[1:].strip()}" for line in lines
            if line.startswith("-") and not line.startswith("---")
        ])

        if not changes:
            print(f"     ⚠️ No significant code changes detected.")
            continue

        change_summary = "\n".join(changes[:20])  # Limit to first 20 changes
        prompt = f"""Review the following code changes in file '{filename}':
{change_summary}

Provide:
1. Code quality assessment
2. Potential bugs or issues
3. Suggestions for improvement
4. Security considerations

Keep your response concise and actionable."""

        suggestions = call_groq_api(prompt)
        print(f"\n📄 File: {filename}")
        print(f"🔄 Changes Analyzed: {len(changes)}")
        print(f"🧠 Review Suggestions:\n{suggestions}")
        print("-" * 60)

def review_all_prs(repo: str):
    print("🔄 Fetching all pull requests...")
    prs = github_api_get(f"/repos/{repo}/pulls", params={"state": "all", "per_page": 10})
    if not prs:
        print("❌ No PRs found in this repository.")
        return

    print(f"✅ Found {len(prs)} pull requests.\n")
    for pr in prs:
        pr_number = pr.get("number")
        if pr_number:
            review_pr_by_number(repo, pr_number)

def review_pr(repo: str):
    pr_number = get_recent_pr(repo)
    if pr_number:
        review_pr_by_number(repo, pr_number)
    else:
        print("⚠️ No recent PRs found. Attempting to review all available PRs...")
        review_all_prs(repo)

if __name__ == "__main__":
    try:
        repo = input("🔗 Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'.")
        else:
            review_pr(repo)
    except KeyboardInterrupt:
        print("\n⛔ Aborted by user.")
