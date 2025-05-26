from utils import fetch_pr_files, get_recent_pr, call_groq_api

def scan_security(repo: str):
    pr_number = get_recent_pr(repo)
    if not pr_number:
        print("No recent PRs found.")
        return
    print(f"\n=== Security Scan on PR #{pr_number} for {repo} ===")
    files = fetch_pr_files(repo, pr_number)
    if not files:
        print("No files found or error fetching PR.")
        return

    print(f"Scanning {len(files)} files for security issues...")
    for i, f in enumerate(files[:5], 1):
        filename = f.get("filename", "unknown")
        patch = f.get("patch", "")
        if not patch:
            print(f"  {i}. {filename} - No changes to scan")
            continue

        print(f"  {i}. Scanning {filename}...")
        added_lines = [line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++")]
        if not added_lines:
            continue

        code_sample = "\n".join(added_lines[:30])
        prompt = f"""Perform a security analysis on this code from file '{filename}':
{code_sample}
Look for:
1. SQL injection risks
2. XSS vulnerabilities
3. Authentication/authorization issues
4. Input validation problems
5. Hardcoded secrets/credentials
6. Unsafe deserialization
7. Path traversal issues
8. Command injection risks
For each issue:
- Severity (Critical/High/Medium/Low)
- Description
- Specific line or pattern
- Remediation suggestion
If no issues, state "No obvious security issues detected."
"""
        
        analysis = call_groq_api(prompt)
        print(f"\nFile: {filename}")
        print(f"Lines Scanned: {len(added_lines)}")
        print(f"Analysis:\n{analysis}")
        print("-" * 60)

if __name__ == "__main__":
    repo = input("Enter GitHub repo (owner/repo): ").strip()
    if not repo or "/" not in repo:
        print("❌ Invalid repository format. Use 'owner/repo'")
    else:
        scan_security(repo)