from utils import fetch_commit, fetch_commit_diff, get_recent_commit, call_groq_api
import json
import re
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def analyze_commit(repo: str):
    """Analyze the latest commit in the given repository."""
    commit_sha = get_recent_commit(repo)
    if not commit_sha:
        return {"error": "No recent commits found"}

    commit = fetch_commit(repo, commit_sha)
    if not commit:
        return {"error": "Commit not found"}

    message = commit.get("commit", {}).get("message", "")
    diff = fetch_commit_diff(repo, commit_sha)
    if not diff:
        return {"error": "Diff not found"}

    # Truncate diff to avoid token limits
    if len(diff) > 2000:
        diff = diff[:2000] + "\n... (diff truncated)"

    # Extract commit stats
    stats = commit.get("stats", {})
    files_changed = len(commit.get("files", []))
    additions = stats.get("additions", 0)
    deletions = stats.get("deletions", 0)
    complexity = "Low" if additions + deletions < 100 else "Medium" if additions + deletions < 500 else "High"

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

Provide the response in JSON format with:
- rating: "Good", "Fair", or "Poor"
- score: Numeric score from 1 to 10
- analysis: Object with three keys (messageAccuracy, messagePractices, changesCohesion), each containing:
  - score: Numeric score from 1 to 10
  - description: Brief explanation
  - status: "good", "fair", or "poor"
- suggestions: Array of suggested improvements

Ensure the response is valid JSON wrapped in markdown code blocks (```json\n...\n```)."""

    result = call_groq_api(prompt)
    if not result:
        logger.error("Grok API returned no result")
        return {"error": "AI analysis failed"}

    logger.debug(f"Raw Grok API response: {result}")

    try:
        # Extract content from Grok API response
        if isinstance(result, dict) and "choices" in result:
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        else:
            content = result if isinstance(result, str) else str(result)

        # Strip markdown code blocks
        json_match = re.search(r'```json\n([\s\S]*?)\n```', content, re.MULTILINE)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = content.strip()

        # Parse JSON
        analysis_data = json.loads(json_str)
    except Exception as e:
        logger.error(f"Failed to parse Grok response: {str(e)}")
        logger.debug(f"Content attempted: {content}")
        return {
            "commitSha": commit_sha,
            "commitMessage": message,
            "rating": "Fair",
            "score": 5,
            "analysis": {
                "messageAccuracy": {"score": 5, "description": "Analysis failed due to invalid response", "status": "fair"},
                "messagePractices": {"score": 5, "description": "Analysis failed due to invalid response", "status": "fair"},
                "changesCohesion": {"score": 5, "description": "Analysis failed due to invalid response", "status": "fair"}
            },
            "suggestions": [],
            "stats": {
                "filesChanged": files_changed,
                "additions": additions,
                "deletions": deletions,
                "complexity": complexity
            },
            "diff": diff
        }

    return {
        "commitSha": commit_sha,
        "commitMessage": message,
        "rating": analysis_data.get("rating", "Fair"),
        "score": analysis_data.get("score", 5),
        "analysis": {
            "messageAccuracy": analysis_data.get("analysis", {}).get("messageAccuracy", {
                "score": 5,
                "description": "No analysis provided",
                "status": "fair"
            }),
            "messagePractices": analysis_data.get("analysis", {}).get("messagePractices", {
                "score": 5,
                "description": "No analysis provided",
                "status": "fair"
            }),
            "changesCohesion": analysis_data.get("analysis", {}).get("changesCohesion", {
                "score": 5,
                "description": "No analysis provided",
                "status": "fair"
            })
        },
        "suggestions": analysis_data.get("suggestions", []),
        "stats": {
            "filesChanged": files_changed,
            "additions": additions,
            "deletions": deletions,
            "complexity": complexity
        },
        "diff": diff
    }

if __name__ == "__main__":
    try:
        repo = input("📦 Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
        else:
            result = analyze_commit(repo)
            print(json.dumps(result, indent=2))
    except KeyboardInterrupt:
        print("\n👋 Exiting.")