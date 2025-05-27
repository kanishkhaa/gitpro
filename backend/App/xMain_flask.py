from flask import Flask, jsonify, request
from flask_cors import CORS
from smartcode import review_pr
from productivity import get_productivity_metrics
from commit_analyzer import analyze_commit
from doc_generator import generate_docs
from security import scan_security
from git_history import generate_history_summary
from onboarding import onboarding_assistant, fetch_file_content, generate_file_description
from utils import github_api_get
from activity_notifier import activity_notifier
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

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

@app.route("/api/file-content", methods=["POST"])
def get_file_content():
    try:
        data = request.get_json()
        repo = data.get("repo", "")
        branch = data.get("branch", "main")
        path = data.get("path", "")
        logging.debug(f"Fetching content for {repo}/{path}, branch {branch}")

        if not repo or "/" not in repo or not path:
            return jsonify({"error": "Missing or invalid repo or path"}), 400

        content = fetch_file_content(repo, path, branch)
        if not content:
            return jsonify({"error": f"Could not fetch content for {path}"}), 404

        return jsonify({"content": content})
    except Exception as e:
        logging.error(f"Error in get_file_content: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyze-file", methods=["POST"])
def analyze_file():
    try:
        data = request.get_json()
        repo = data.get("repo", "")
        file_path = data.get("file_path", "")
        content = data.get("content", "")
        logging.debug(f"Analyzing file {repo}/{file_path}")

        if not repo or "/" not in repo or not file_path or not content:
            return jsonify({"error": "Missing or invalid repo, file_path, or content"}), 400

        analysis = generate_file_description(repo, file_path, content)
        return jsonify({"result": analysis})
    except Exception as e:
        logging.error(f"Error in analyze_file: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/execute/<int:feature_id>", methods=["POST"])
def execute_feature(feature_id):
    try:
        data = request.get_json()
        repo = data.get("repo", "")
        branch = data.get("branch", "main")
        logging.debug(f"Executing feature {feature_id} for repo {repo}, branch {branch}")
        if not repo or "/" not in repo:
            return jsonify({"error": "Invalid repository format. Use 'owner/repo'"}), 400

        if feature_id not in range(1, 9):
            return jsonify({"error": "Invalid feature ID. Use 1-8"}), 400

        result = None
        if feature_id == 1:
            result = review_pr(repo)
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
            result = onboarding_assistant(repo, branch)
        elif feature_id == 8:
            result = activity_notifier(repo)

        if result is None:
            logging.warning(f"Feature {feature_id} returned None")
            result = {"status": "Feature executed, check server logs or notifications.json"}

        logging.debug(f"Returning result: {result}")
        return jsonify({"result": result})
    except Exception as e:
        logging.error(f"Error in execute_feature: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)