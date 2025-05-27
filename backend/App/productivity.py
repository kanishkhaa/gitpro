from datetime import datetime
from utils import github_api_get

def fetch_all_prs(repo: str, state: str = "all", per_page: int = 50, max_pages: int = 10):
    """Fetch all PRs in the repo using pagination."""
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
            break
    return all_prs

def get_productivity_metrics(repo: str):
    """Calculate and return comprehensive productivity metrics for a repository."""
    prs = github_api_get(
        f"/repos/{repo}/pulls",
        params={"state": "all", "per_page": 50, "sort": "updated", "direction": "desc"}
    )

    if not prs or not isinstance(prs, list) or len(prs) == 0:
        prs = fetch_all_prs(repo)

    if not prs:
        return {"error": "No PRs found"}

    turnaround_times = []
    total_additions = 0
    total_deletions = 0
    contributors = set()
    merged_prs = 0
    activities = []
    contributor_pr_counts = {}

    for pr in prs:
        user = pr.get("user", {}).get("login")
        if user:
            contributors.add(user)
            contributor_pr_counts[user] = contributor_pr_counts.get(user, 0) + 1

        pr_number = pr.get("number")
        pr_details = github_api_get(f"/repos/{repo}/pulls/{pr_number}")
        if pr_details:
            total_additions += pr_details.get("additions", 0)
            total_deletions += pr_details.get("deletions", 0)

        # Activity logging
        created_at = pr.get("created_at")
        if created_at and user:
            activities.append({
                "time": created_at,
                "action": f"PR #{pr_number} opened",
                "user": user,
                "type": "open"
            })

        if pr.get("merged_at"):
            merged_prs += 1
            created = pr.get("created_at")
            merged = pr.get("merged_at")
            if created and merged and user:
                try:
                    c_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                    m_dt = datetime.fromisoformat(merged.replace("Z", "+00:00"))
                    delta = (m_dt - c_dt).total_seconds() / 3600
                    turnaround_times.append(delta)
                    activities.append({
                        "time": merged,
                        "action": f"PR #{pr_number} merged successfully",
                        "user": user,
                        "type": "merge"
                    })
                except Exception:
                    pass

    avg_turnaround = sum(turnaround_times) / len(turnaround_times) if turnaround_times else 0
    avg_changes_per_pr = (total_additions + total_deletions) / max(merged_prs, 1)

    # Simulated metrics
    code_quality_score = min(5.0, max(1.0, 5.0 - (avg_changes_per_pr / 500)))  # Larger PRs lower quality
    team_collaboration = min(100, len(contributors) * 10)  # More contributors = better collaboration
    test_coverage = min(100, 80 + (len(contributors) * 2))  # Simulate coverage
    security_score = "A" if avg_changes_per_pr < 500 else "B"  # Smaller PRs = safer
    code_complexity = "Low" if avg_changes_per_pr < 300 else "Medium" if avg_changes_per_pr < 600 else "High"

    # Most active contributor
    most_active = max(contributor_pr_counts.items(), key=lambda x: x[1], default=("unknown", 0))[0]
    fastest_review = min(turnaround_times, default=0)

    # Sort activities by time (newest first) and limit to 4
    activities = sorted(activities, key=lambda x: x["time"], reverse=True)[:4]

    return {
        "avg_turnaround_hours": round(avg_turnaround, 1),
        "avg_turnaround_days": round(avg_turnaround / 24, 1),
        "total_merged_prs": merged_prs,
        "total_lines_added": total_additions,
        "total_lines_deleted": total_deletions,
        "net_lines_changed": total_additions - total_deletions,
        "unique_contributors": len(contributors),
        "avg_changes_per_pr": round(avg_changes_per_pr),
        "code_quality_score": round(code_quality_score, 1),
        "team_collaboration": team_collaboration,
        "test_coverage": test_coverage,
        "security_score": security_score,
        "code_complexity": code_complexity,
        "most_active_contributor": most_active,
        "fastest_review_time": round(fastest_review, 1),
        "recent_activities": activities
    }

if __name__ == "__main__":
    try:
        repo = input("📦 Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
        else:
            result = get_productivity_metrics(repo)
            print(result)
    except KeyboardInterrupt:
        print("\n👋 Exiting.")