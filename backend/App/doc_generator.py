import requests
from utils import get_changed_files, call_groq_api

def generate_docs(repo: str):
    files = get_changed_files(repo)
    if not files:
        print("No recent files found.")
        return
    print(f"\n=== AI Documentation Generator for {repo} ===")
    for i, path in enumerate(files[:3], 1):
        print(f"  {i}. Generating docs for {path}...")
        for branch in ['main', 'master']:
            raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
            try:
                resp = requests.get(raw_url, timeout=30)
                if resp.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                continue
        else:
            print(f"    ❌ Failed to fetch {path}")
            continue

        content = resp.text
        if len(content) > 3000:
            content = content[:3000] + "\n... (truncated)"

        prompt = f"""Generate comprehensive documentation for this source code file '{path}':
{content}
Provide:
1. Brief description of the file's purpose
2. Main functions/classes and their purposes
3. Usage examples if applicable
4. Dependencies and requirements
5. Any important notes for developers
Format as markdown documentation."""
        
        doc = call_groq_api(prompt)
        print(f"\nDocumentation for {path}:")
        print(doc)
        print("=" * 60)

if __name__ == "__main__":
    repo = input("Enter GitHub repo (owner/repo): ").strip()
    if not repo or "/" not in repo:
        print("❌ Invalid repository format. Use 'owner/repo'")
    else:
        generate_docs(repo)