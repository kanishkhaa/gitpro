from smartcode import review_pr
from productivity import get_productivity_metrics
from commit_analyzer import analyze_commit
from doc_generator import generate_docs
from security import scan_security
from git_history import generate_history_summary
from onboarding import onboarding_assistant
from activity_notifier import activity_notifier

def main():
    print("🚀 GitHub AI Code Analyzer")
    print("=" * 40)
    print("Available features:")
    print("1: Smart Code Reviewer (analyzes most recent PR)")
    print("2: Developer Productivity Insights")
    print("3: Commit Intent Analyzer (analyzes most recent commit)")
    print("4: AI-Powered Documentation Generator (for recent files)")
    print("5: Security Scan with AI (scans most recent PR)")
    print("6: Visual Git History + Repository Summary (entire history)")
    print("7: Onboarding Assistant (understand repo structure and file purposes)")
    print("8: Activity Notifier (saves push, pull requests, issues, etc. to JSON and prints)")
    print("-" * 40)

    try:
        choice = input("Enter choice (1-8): ").strip()
        if choice not in ["1", "2", "3", "4", "5", "6", "7", "8"]:
            print("❌ Invalid choice. Please select 1-8.")
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
        elif choice == "6":
            generate_history_summary(repo)
        elif choice == "7":
            onboarding_assistant(repo)
        elif choice == "8":
            activity_notifier(repo)

    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    main()