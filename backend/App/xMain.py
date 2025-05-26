from smartcode import review_pr
from productivity import get_productivity_metrics
from commit_analyzer import analyze_commit
from doc_generator import generate_docs
from security import scan_security

def main():
    print("🚀 GitHub AI Code Analyzer")
    print("=" * 40)
    print("Available features:")
    print("1: Smart Code Reviewer (analyzes most recent PR)")
    print("2: Developer Productivity Insights")
    print("3: Commit Intent Analyzer (analyzes most recent commit)")
    print("4: AI-Powered Documentation Generator (for recent files)")
    print("5: Security Scan with AI (scans most recent PR)")
    print("-" * 40)

    try:
        choice = input("Enter choice (1-5): ").strip()
        if choice not in ["1", "2", "3", "4", "5"]:
            print("❌ Invalid choice. Please select 1-5.")
            return

        repo = input("Enter GitHub repo (owner/repo): ").strip()
        if not repo or "/" not in repo:
            print("❌ Invalid repository format. Use 'owner/repo'")
            return

        if choice == "1":
            review_pr(repo)
        elif choice == "2":
            get_productivity_metrics(repo)
        elif choice == "3":
            analyze_commit(repo)
        elif choice == "4":
            generate_docs(repo)
        elif choice == "5":
            scan_security(repo)

    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    main()