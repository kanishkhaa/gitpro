from datetime import datetime
from utils import github_api_get, call_groq_api
import logging

logging.basicConfig(level=logging.DEBUG)

def fetch_commits(repo: str) -> list:
    logging.debug(f"Fetching commits for {repo}")
    params = {"per_page": 100}
    commits = []
    page = 1
    while True:
        try:
            part = github_api_get(f"/repos/{repo}/commits", params={**params, "page": page})
            if not part:
                break
            commits.extend(part)
            if len(part) < 100:
                break
            page += 1
        except Exception as e:
            logging.error(f"Error fetching commits: {str(e)}")
            return []
    logging.debug(f"Fetched {len(commits)} commits")
    return commits

def generate_history_summary(repo: str):
    logging.debug(f"Processing repo: {repo}")
    try:
        if not repo or '/' not in repo:
            logging.error("Invalid repository format")
            return {"error": "Invalid repository format. Use 'owner/repo'"}

        # Fetch commits
        commits = fetch_commits(repo)
        if not commits:
            logging.error("No commits found")
            return {"error": "No commits found in the repository."}

        # Prepare commit data for frontend
        formatted_commits = []
        for commit in commits:
            sha = commit.get("sha", "unknown")
            date = commit.get("commit", {}).get("author", {}).get("date", "")
            message = commit.get("commit", {}).get("message", "").split("\n")[0]
            author = commit.get("commit", {}).get("author", {}).get("name", "unknown")
            
            if date:
                try:
                    date_str = datetime.fromisoformat(date.replace("Z", "+00:00")).isoformat()
                    # Fetch commit details for accurate changes
                    changes = {
                        "additions": 0,  # Default fallback
                        "deletions": 0,
                        "files": 0
                    }
                    try:
                        commit_details = github_api_get(f"/repos/{repo}/commits/{sha}")
                        changes = {
                            "additions": commit_details.get("stats", {}).get("additions", 0),
                            "deletions": commit_details.get("stats", {}).get("deletions", 0),
                            "files": len(commit_details.get("files", []))
                        }
                    except Exception as e:
                        logging.warning(f"Failed to fetch commit details for {sha}: {str(e)}")
                        # Fallback values only if API call fails
                        changes = {
                            "additions": 0,
                            "deletions": 0,
                            "files": 0
                        }
                    formatted_commits.append({
                        "sha": sha,
                        "message": message,
                        "author": author,
                        "date": date_str,
                        "changes": changes
                    })
                except ValueError as e:
                    logging.warning(f"Invalid date format for commit {sha}: {str(e)}")
                    continue

        # Generate AI summary
        commit_messages = [commit.get("commit", {}).get("message", "").split("\n")[0] for commit in commits]
        commit_summary = "\n".join(commit_messages[:50])  # Limit to 50 for AI prompt
        prompt = f"""Summarize the following commit messages from the entire history of repository '{repo}':
{commit_summary}
Focus on:
1. Key features added or modified
2. Major bug fixes
3. Significant refactoring or improvements
4. Any other notable changes
Provide a concise summary (3-5 bullet points) in markdown format."""
        
        try:
            summary = call_groq_api(prompt) or "No summary generated."
        except Exception as e:
            logging.error(f"Error calling Grok API: {str(e)}")
            summary = "Failed to generate summary due to AI service error."

        logging.debug(f"Returning {len(formatted_commits)} commits and summary")
        return {
            "commits": formatted_commits,
            "summary": summary
        }

    except Exception as e:
        logging.error(f"Error in generate_history_summary: {str(e)}")
        return {"error": f"Failed to process repository: {str(e)}"}