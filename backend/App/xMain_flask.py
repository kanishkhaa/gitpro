from flask import Flask, jsonify, request
from flask_cors import CORS
from smartcode import review_pr
from productivity import get_productivity_metrics
from commit_analyzer import analyze_commit
from doc_generator import generate_docs
from security import scan_security
from git_history import generate_history_summary
from onboarding import onboarding_assistant
from activity_notifier import activity_notifier

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route("/api/features", methods=["GET"])
def get_features():
    features = [
        {"id": 1, "name": "Smart Code Reviewer", "description": "Analyzes most recent PR"},
        {"id": 2, "name": "Developer Productivity Insights", "description": "Productivity metrics"},
        {"id": 3, "name": "Commit Intent Analyzer", "description": "Analyzes most recent commit"},
        {"id": 4, "name": "AI-Powered Documentation Generator", "description": "Generates docs for recent files"},
        {"id": 5, "name": "Security Scan with AI", "description": "Scans most recent PR"},
        {"id": 6, "name": "Visual Git History + Repository Summary", "description": "Entire history"},
        {"id": 7, "name": "Onboarding Assistant", "description": "Understand repo structure"},
        {"id": 8, "name": "Activity Notifier", "description": "Tracks collaborator actions to JSON"}
    ]
    return jsonify({"features": features})

@app.route("/api/execute/<int:feature_id>", methods=["POST"])
def execute_feature(feature_id):
    try:
        data = request.get_json()
        repo = data.get("repo", "")
        if not repo or "/" not in repo:
            return jsonify({"error": "Invalid repository format. Use 'owner/repo'"}), 400

        if feature_id not in range(1, 9):
            return jsonify({"error": "Invalid feature ID. Use 1-8"}), 400

        result = None
        if feature_id == 1:
            result = review_pr(repo)  # Adjust if review_pr doesn't return data
        elif feature_id == 2:
            result = get_productivity_metrics(repo)
        elif feature_id == 3:
            result = analyze_commit(repo)
        elif feature_id == 4:
            result = generate_docs(repo)
        elif feature_id == 5:
            result = scan_security(repo)
        elif feature_id == 6:
            result = generate_history_summary(repo)
        elif feature_id == 7:
            result = onboarding_assistant(repo)
        elif feature_id == 8:
            result = activity_notifier(repo)

        # Handle cases where scripts don't return data
        if result is None:
            result = {"status": "Feature executed, check server logs or notifications.json"}

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)