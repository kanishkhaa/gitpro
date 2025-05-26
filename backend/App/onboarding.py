import requests
from utils import github_api_get, call_groq_api

def fetch_repo_tree(repo: str, branch: str = "main") -> list:
    # Try common branch names (main, master)
    branches = [branch, "master"] if branch == "main" else [branch, "main"]
    tree = None
    for b in branches:
        tree_data = github_api_get(f"/repos/{repo}/git/trees/{b}?recursive=1")
        if tree_data and "tree" in tree_data:
            tree = tree_data["tree"]
            break
    if not tree:
        print(f"Could not fetch repository tree for {repo}.")
        return []
    return [item for item in tree if item["type"] == "blob"]  # Only include files, not directories

def fetch_file_content(repo: str, path: str, branch: str = "main") -> str:
    branches = [branch, "master"] if branch == "main" else [branch, "main"]
    for b in branches:
        raw_url = f"https://raw.githubusercontent.com/{repo}/{b}/{path}"
        try:
            resp = requests.get(raw_url, timeout=30)
            if resp.status_code == 200:
                return resp.text
        except requests.exceptions.RequestException:
            continue
    print(f"    ❌ Failed to fetch content for {path}")
    return ""

def generate_file_description(repo: str, file_path: str, content: str) -> str:
    if not content:
        return f"No content available for {file_path}."
    
    if len(content) > 3000:
        content = content[:3000] + "\n... (truncated)"

    prompt = f"""Analyze the following code from file '{file_path}' in repository '{repo}':
{content}
Provide a concise description (2-3 sentences) of:
1. The file's purpose
2. Main functions/classes and their roles
3. Any notable usage or context
Format as plain text."""
    
    return call_groq_api(prompt)

def onboarding_assistant(repo: str):
    print(f"\n=== Onboarding Assistant for {repo} ===")
    print("Fetching repository structure...")
    
    files = fetch_repo_tree(repo)
    if not files:
        print("No files found or error fetching repository structure.")
        return

    print(f"\nFound {len(files)} files in the repository:")
    for i, file in enumerate(files[:20], 1):  # Limit to 20 files for brevity
        print(f"  {i}. {file['path']}")
    
    print("\nEnter the number of a file to analyze (or 'all' to analyze all files, or 'exit' to quit):")
    while True:
        choice = input("> ").strip().lower()
        if choice == "exit":
            break
        if choice == "all":
            print("\nAnalyzing all files (limited to first 20 for brevity)...")
            for i, file in enumerate(files[:20], 1):
                path = file["path"]
                print(f"\n{i}. Analyzing {path}...")
                content = fetch_file_content(repo, path)
                description = generate_file_description(repo, path, content)
                print(f"Description: {description}")
                print("-" * 50)
            break
        try:
            index = int(choice) - 1
            if 0 <= index < min(len(files), 20):
                path = files[index]["path"]
                print(f"\nAnalyzing {path}...")
                content = fetch_file_content(repo, path)
                description = generate_file_description(repo, path, content)
                print(f"Description: {description}")
            else:
                print("Invalid file number. Choose a number from the list.")
        except ValueError:
            print("Invalid input. Enter a number, 'all', or 'exit'.")

if __name__ == "__main__":
    repo = input("Enter GitHub repo (owner/repo): ").strip()
    if not repo or "/" not in repo:
        print("❌ Invalid repository format. Use 'owner/repo'")
    else:
        onboarding_assistant(repo)