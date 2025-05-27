import requests
from typing import List, Dict, Any, Optional
from utils import github_api_get, call_groq_api
import logging
import json
import re

logging.basicConfig(level=logging.DEBUG)

def fetch_repo_tree(repo: str, branch: str = "main") -> List[Dict[str, Any]]:
    """
    Fetch the repository tree from GitHub and return a structured file tree.
    """
    branches = [branch, "master"] if branch == "main" else [branch, "main"]
    tree = None
    for b in branches:
        tree_data = github_api_get(f"/repos/{repo}/git/trees/{b}?recursive=1")
        if tree_data and "tree" in tree_data:
            tree = tree_data["tree"]
            break
    if not tree:
        logging.error(f"Could not fetch repository tree for {repo}.")
        return []

    # Build a hierarchical file tree
    file_tree = []
    path_map = {}

    for item in tree:
        path_parts = item["path"].split("/")
        current_level = file_tree
        current_path = ""

        for i, part in enumerate(path_parts):
            current_path = f"{current_path}/{part}" if current_path else part

            if i == len(path_parts) - 1 and item["type"] == "blob":
                # File node
                language = infer_language(part)
                current_level.append({
                    "path": current_path,
                    "type": "file",
                    "size": item.get("size", 0),
                    "language": language
                })
            else:
                # Folder node
                if current_path not in path_map:
                    path_map[current_path] = {
                        "path": current_path,
                        "type": "folder",
                        "children": []
                    }
                    current_level.append(path_map[current_path])
                current_level = path_map[current_path]["children"]

    return file_tree

def infer_language(filename: str) -> str:
    """
    Infer the programming language based on file extension.
    """
    extension_map = {
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".py": "python",
        ".html": "javascript",  # Treat .html as JSX if it contains React code
        ".css": "css",
        ".json": "json",
        ".md": "markdown"
    }
    for ext, lang in extension_map.items():
        if filename.endswith(ext):
            return lang
    return "unknown"

def fetch_file_content(repo: str, path: str, branch: str = "main") -> str:
    """
    Fetch the content of a file from the GitHub repository.
    """
    branches = [branch, "master"] if branch == "main" else [branch, "main"]
    for b in branches:
        raw_url = f"https://raw.githubusercontent.com/{repo}/{b}/{path}"
        try:
            resp = requests.get(raw_url, timeout=30)
            if resp.status_code == 200:
                return resp.text
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to fetch content for {path}: {str(e)}")
            continue
    return ""

def generate_file_description(repo: str, file_path: str, content: str) -> Dict[str, Any]:
    """
    Generate a description and analysis for a file using Grok API, tailored to file type.
    """
    if not content:
        return {
            "description": f"No content available for {file_path}.",
            "functions": [],
            "complexity": "unknown",
            "suggestions": ["Check file content for syntax errors.", "Ensure file is accessible and not empty."]
        }

    if len(content) > 3000:
        content = content[:3000] + "\n... (truncated)"

    language = infer_language(file_path)
    if language == "css":
        prompt = f"""Analyze the following CSS code from file '{file_path}' in repository '{repo}':
{content}
Provide a JSON object with:
1. description: A concise description (2-3 sentences) of the file's purpose, key styles, and their usage in the project.
2. functions: An empty list (CSS files do not contain functions or classes in the programming sense).
3. complexity: A string indicating complexity level ('low', 'medium', 'high', or 'not applicable' for CSS).
4. suggestions: A list of 1-3 improvement suggestions for the CSS (e.g., organization, specificity, performance).
Format the response as a JSON object, enclosed in triple backticks (```json ... ```)."""
    elif language == "javascript" and (file_path.endswith(".html") or file_path.endswith(".jsx")):
        prompt = f"""Analyze the following JSX/React code from file '{file_path}' in repository '{repo}':
{content}
Provide a JSON object with:
1. description: A concise description (2-3 sentences) of the file's purpose, main React components, and their role in the project.
2. functions: A list of main React component names and key functions (if applicable).
3. complexity: A string indicating complexity level ('low', 'medium', 'high').
4. suggestions: A list of 1-3 improvement suggestions for the JSX/React code.
Format the response as a JSON object, enclosed in triple backticks (```json ... ```)."""
    else:
        prompt = f"""Analyze the following code from file '{file_path}' in repository '{repo}':
{content}
Provide a JSON object with:
1. description: A concise description (2-3 sentences) of the file's purpose, main functions/classes, and notable usage.
2. functions: A list of main function or class names (if applicable).
3. complexity: A string indicating complexity level ('low', 'medium', 'high').
4. suggestions: A list of 1-3 improvement suggestions.
Format the response as a JSON object, enclosed in triple backticks (```json ... ```)."""
    
    response = call_groq_api(prompt)
    logging.debug(f"Raw Grok API response for {file_path}: {response}")
    
    try:
        if not response:
            raise ValueError("Empty response from Grok API")
        
        # Extract JSON content from the response, accounting for possible markdown or prefix text
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response, re.MULTILINE)
        if json_match:
            json_content = json_match.group(1).strip()
        else:
            # Fallback: try to find any JSON object in the response
            json_match = re.search(r'\{[\s\S]*?\}', response, re.MULTILINE)
            json_content = json_match.group(0).strip() if json_match else response

        result = json.loads(json_content)
        # Validate expected keys in the response
        expected_keys = {"description", "functions", "complexity", "suggestions"}
        if not all(key in result for key in expected_keys):
            raise ValueError(f"Incomplete JSON response: missing some of {expected_keys}")
        return result
    except Exception as e:
        logging.error(f"Error processing Grok response for {file_path}: {str(e)}")
        return {
            "description": f"Failed to analyze {file_path} due to processing error.",
            "functions": [],
            "complexity": "unknown",
            "suggestions": [
                "Check file content for syntax errors.",
                "Ensure file is accessible and not empty.",
                "Verify Grok API response format and configuration."
            ]
        }

def onboarding_assistant(repo: str, branch: str = "main") -> Dict[str, Any]:
    """
    Generate a repository structure and initial file analyses for onboarding.
    """
    logging.debug(f"Running onboarding assistant for {repo}, branch {branch}")
    files = fetch_repo_tree(repo, branch)
    if not files:
        return {"error": "No files found or error fetching repository structure."}

    # Analyze a limited number of files (e.g., first 5) to avoid overloading
    analyses = {}
    file_count = 0
    for file in files:
        if file["type"] == "file" and file_count < 5:
            content = fetch_file_content(repo, file["path"], branch)
            analyses[file["path"]] = generate_file_description(repo, file["path"], content)
            file_count += 1

    return {
        "files": files,
        "analyses": analyses
    }