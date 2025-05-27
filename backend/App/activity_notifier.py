import os
import time
import json
from datetime import datetime
from dotenv import load_dotenv
from utils import github_api_get

# Load environment variables
load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
JSON_FILE = "notifications.json"

if not GITHUB_TOKEN:
    print("WARNING: GITHUB_TOKEN not set. Rate limiting may occur. Get one at https://github.com/settings/tokens")

def load_existing_notifications():
    try:
        if os.path.exists(JSON_FILE):
            with open(JSON_FILE, "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        return []
    except (json.JSONDecodeError, IOError) as e:
        print(f"DEBUG: Error loading {JSON_FILE}: {e}. Starting with empty list.")
        return []

def save_notification(notification: dict):
    notifications = load_existing_notifications()
    notifications.append(notification)
    try:
        os.makedirs(os.path.dirname(JSON_FILE) or ".", exist_ok=True)
        with open(JSON_FILE, "w") as f:
            json.dump(notifications, f, indent=2)
        print(f"DEBUG: Successfully saved notification to {os.path.abspath(JSON_FILE)}")
    except IOError as e:
        print(f"ERROR: Failed to write to {JSON_FILE}: {e}. Check directory permissions.")

def print_notification(notification: dict):
    print("\n" + "=" * 80)
    print(f"Repository: {notification['repository']}")
    print(f"Event: {notification['event']}")
    print(f"Actor: {notification['actor']}")
    print(f"Time: {notification['time']}")
    print(f"Operation: {notification['operation']}")
    print(f"Updates: {notification['updates']}")
    print("=" * 80)

def fetch_commit_details(repo: str, commit_sha: str) -> dict:
    try:
        commit = github_api_get(f"/repos/{repo}/commits/{commit_sha}")
        if commit:
            changes = []
            for f in commit.get("files", []):
                status = f.get("status", "unknown")
                change_type = {
                    "added": "Added",
                    "modified": "Modified",
                    "removed": "Deleted"
                }.get(status, status.capitalize())
                changes.append(f"{change_type}: {f['filename']}")
            return {
                "message": commit.get("commit", {}).get("message", "No message"),
                "changes": changes or ["No file changes"]
            }
        return {"message": "Unknown", "changes": ["No file changes"]}
    except Exception as e:
        print(f"DEBUG: Error fetching commit {commit_sha}: {e}")
        return {"message": "Error fetching commit", "changes": ["None"]}

def fetch_pr_details(repo: str, pr_number: int) -> dict:
    try:
        pr = github_api_get(f"/repos/{repo}/pulls/{pr_number}")
        if pr:
            files = github_api_get(f"/repos/{repo}/pulls/{pr_number}/files") or []
            changes = []
            for f in files:
                status = f.get("status", "unknown")
                change_type = {
                    "added": "Added",
                    "modified": "Modified",
                    "removed": "Deleted"
                }.get(status, status.capitalize())
                changes.append(f"{change_type}: {f['filename']}")
            return {
                "title": pr.get("title", "No title"),
                "changes": changes or ["No file changes"]
            }
        return {"title": "Unknown", "changes": ["No file changes"]}
    except Exception as e:
        print(f"DEBUG: Error fetching PR #{pr_number}: {e}")
        return {"title": "Error fetching PR", "changes": ["None"]}

def fetch_recent_events(repo: str) -> list:
    params = {"per_page": 50}
    try:
        events = github_api_get(f"/repos/{repo}/events", params=params)
        if events is None:
            print("DEBUG: API returned None. Check GITHUB_TOKEN or repository access.")
            return []
        print(f"DEBUG: Fetched {len(events)} events from API.")
        return events
    except Exception as e:
        print(f"ERROR: Failed to fetch events: {e}")
        return []

def activity_notifier(repo: str, poll_interval: int = 60):
    print(f"\n=== Activity Notifier for {repo} ===")
    print(f"Monitoring repository events (polling every {poll_interval} seconds)...")
    print(f"Events will be saved to {JSON_FILE} and printed to console.")
    print("Press Ctrl+C to stop monitoring.")

    last_event_time = None
    # Map GitHub API event types to simplified names
    event_type_map = {
        "PushEvent": "push",
        "PullRequestEvent": "pull_request",
        "IssuesEvent": "issues",
        "IssueCommentEvent": "issue_comment"
    }
    monitored_events = list(event_type_map.values())

    try:
        while True:
            events = fetch_recent_events(repo)
            if not events:
                print("No new events found in this poll.")
            else:
                for event in reversed(events):
                    api_event_type = event.get("type", "")
                    event_type = event_type_map.get(api_event_type, "").lower()
                    if event_type not in monitored_events:
                        print(f"DEBUG: Skipping event type: {api_event_type}")
                        continue

                    created_at = event.get("created_at", "")
                    if not created_at:
                        print("DEBUG: Event missing created_at, skipping.")
                        continue

                    if last_event_time and created_at <= last_event_time:
                        continue

                    actor = event.get("actor", {}).get("login", "unknown")
                    operation = {
                        "push": "git push",
                        "pull_request": "git pull-request",
                        "issues": "issue creation/update",
                        "issue_comment": "issue comment"
                    }.get(event_type, "unknown operation")

                    updates = ""
                    if event_type == "push":
                        commits = event.get("payload", {}).get("commits", [])
                        if commits:
                            commit = commits[0]
                            commit_sha = commit.get("sha", "")
                            commit_details = fetch_commit_details(repo, commit_sha)
                            updates = f"Commit by {actor}: {commit_details['message'][:100]}; Changes: {', '.join(commit_details['changes'][:5])}"
                        else:
                            updates = "No commit details available."
                    elif event_type == "pull_request":
                        pr_number = event.get("payload", {}).get("number", 0)
                        pr_details = fetch_pr_details(repo, pr_number)
                        updates = f"PR by {actor}: {pr_details['title'][:100]}; Changes: {', '.join(pr_details['changes'][:5])}"
                    elif event_type == "issues":
                        issue = event.get("payload", {}).get("issue", {})
                        updates = f"Issue by {actor} #{issue.get('number', 'unknown')}: {issue.get('title', 'No title')[:100]}"
                    elif event_type == "issue_comment":
                        comment = event.get("payload", {}).get("comment", {})
                        updates = f"Comment by {actor}: {comment.get('body', 'No comment')[:100]}..."

                    notification = {
                        "repository": repo,
                        "event": event_type.replace("_", " ").title(),
                        "actor": actor,
                        "time": created_at,
                        "operation": operation,
                        "updates": updates
                    }

                    save_notification(notification)
                    print_notification(notification)
                    last_event_time = created_at
                    print(f"DEBUG: Updated last_event_time to {last_event_time}")

            time.sleep(poll_interval)

    except KeyboardInterrupt:
        print("\nStopped monitoring repository events.")
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")

if __name__ == "__main__":
    repo = input("Enter GitHub repo (owner/repo): ").strip()
    if not repo or "/" not in repo:
        print("❌ Invalid repository format. Use 'owner/repo'")
    else:
        activity_notifier(repo)