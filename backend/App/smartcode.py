from utils import fetch_pr_files, get_recent_pr, call_groq_api, github_api_get

def review_pr_by_number(repo: str, pr_number: int):
    result = {
        "prNumber": pr_number,
        "title": f"Review of PR #{pr_number}",
        "timestamp": "",
        "status": "completed",
        "files": []
    }

    files = fetch_pr_files(repo, pr_number)
    if not files:
        return {
            "prNumber": pr_number,
            "title": f"Review of PR #{pr_number}",
            "timestamp": "",
            "status": "failed",
            "files": [],
            "error": "No files found or error fetching PR files."
        }

    for f in files[:5]:  # Limit to first 5 files
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        file_review = {
            "filename": filename,
            "changes": 0,
            "quality": "needs-work",
            "suggestions": []
        }

        if not patch:
            file_review["suggestions"].append({
                "type": "warning",
                "text": "No changes to review"
            })
            result["files"].append(file_review)
            continue

        lines = patch.splitlines()
        changes = [
            f"Added: {line[1:].strip()}" for line in lines
            if line.startswith("+") and not line.startswith("+++")
        ]
        changes.extend([
            f"Removed: {line[1:].strip()}" for line in lines
            if line.startswith("-") and not line.startswith("---")
        ])

        file_review["changes"] = len(changes)

        if not changes:
            file_review["suggestions"].append({
                "type": "warning",
                "text": "No significant code changes detected."
            })
            result["files"].append(file_review)
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
        # Parse suggestions into structured format
        suggestion_lines = suggestions.split("\n")
        current_section = ""
        for line in suggestion_lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith("**Code Quality Assessment:**"):
                current_section = "quality"
                file_review["quality"] = line.replace("**Code Quality Assessment:**", "").strip().lower() or "needs-work"
            elif line.startswith("**Potential Bugs or Issues:**"):
                current_section = "bugs"
            elif line.startswith("**Suggestions for Improvement:**"):
                current_section = "improvements"
            elif line.startswith("**Security Considerations:**"):
                current_section = "security"
            elif line.startswith("-") or line.startswith("1."):
                suggestion_type = {
                    "bugs": "bug",
                    "improvements": "improvement",
                    "security": "security"
                }.get(current_section, "info")
                file_review["suggestions"].append({
                    "type": suggestion_type,
                    "text": line.lstrip("-1234567890. ").strip()
                })

        result["files"].append(file_review)

    return result

def review_all_prs(repo: str):
    prs = github_api_get(f"/repos/{repo}/pulls", params={"state": "all", "per_page": 10})
    if not prs:
        return [{
            "prNumber": 0,
            "title": "No PRs found",
            "timestamp": "",
            "status": "failed",
            "files": [],
            "error": "No PRs found in this repository."
        }]

    results = []
    for pr in prs:
        pr_number = pr.get("number")
        if pr_number:
            review_result = review_pr_by_number(repo, pr_number)
            review_result["timestamp"] = pr.get("updated_at", "")
            results.append(review_result)

    return results

def review_pr(repo: str):
    pr_number = get_recent_pr(repo)
    if pr_number:
        result = review_pr_by_number(repo, pr_number)
        pr_data = github_api_get(f"/repos/{repo}/pulls/{pr_number}")
        result["timestamp"] = pr_data.get("updated_at", "") if pr_data else ""
        return result
    else:
        return review_all_prs(repo)