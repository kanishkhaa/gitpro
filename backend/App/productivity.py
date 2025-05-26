from datetime import datetime
from utils import github_api_get


def fetch_all_prs(repo: str, state: str = "all", per_page: int = 50, max_pages: int = 10):
    """Fetch all PRs in the repo using pagination."""
    print("🔁 Fetching all PRs via pagination...")
    all_prs = []
    for page in range(1, max_pages + 1):
        prs = github_api_get(
            f"/repos/{repo}/pulls",
            params={"state": state, "per_page": per_page, "page": page, "sort": "updated", "direction": "desc"}
        )
        if not prs:
            break
        all_prs.extend(prs)
        if len(prs) < per_page:
            break  # No more pages
    return all_prs


def get_productivity_metrics(repo: str):
    print(f"\n=== 🧑‍💻 Developer Productivity Insights for `{repo}` ===")

    # Try fetching recent PRs first
    prs = github_api_get(
        f"/repos/{repo}/pulls",
        params={"state": "all", "per_page": 50, "sort": "updated", "direction": "desc"}
    )

    # If no PRs are fetched, fallback to all PRs
    if not prs or not isinstance(prs, list) or len(prs) == 0:
        print("⚠️ No recent PRs found or fetch failed. Trying to fetch all PRs...")
        prs = fetch_all_prs(repo)

    if not prs:
        print("❌ Still no PRs found. Exiting.")
        return

    turnaround_times = []
    total_additions = 0
    total_deletions = 0
    contributors = set()
    merged_prs = 0

    for pr in prs:
        if not pr.get("merged_at"):
            continue

        created = pr.get("created_at")
        merged = pr.get("merged_at")
        user = pr.get("user", {}).get("login")
        if user:
            contributors.add(user)

        pr_number = pr.get("number")
        pr_details = github_api_get(f"/repos/{repo}/pulls/{pr_number}")
        if pr_details:
            total_additions += pr_details.get("additions", 0)
            total_deletions += pr_details.get("deletions", 0)

        if created and merged:
            try:
                c_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                m_dt = datetime.fromisoformat(merged.replace("Z", "+00:00"))
                delta = (m_dt - c_dt).total_seconds() / 3600
                turnaround_times.append(delta)
                merged_prs += 1
            except Exception:
                continue

    avg_turnaround = sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0
    print(f"\n📊 Productivity Metrics:")
    print(f"  • 🕒 Avg PR Turnaround Time: {avg_turnaround:.1f} hours ({avg_turnaround/24:.1f} days)")
    print(f"  • ✅ Total Merged PRs: {merged_prs}")
    print(f"  • ➕ Total Lines Added: {total_additions:,}")
    print(f"  • ➖ Total Lines Deleted: {total_deletions:,}")
    print(f"  • 🔁 Net Lines Changed: {total_additions - total_deletions:,}")
    print(f"  • 👥 Unique Contributors: {len(contributors)}")
    print(f"  • 📏 Avg Changes per PR: {(total_additions + total_deletions) / max(merged_prs, 1):.0f} lines")


if __name__ == "__main__":
    try:
        repo = input("📦 Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
        else:
            get_productivity_metrics(repo)
    except KeyboardInterrupt:
        print("\n👋 Exiting.")
