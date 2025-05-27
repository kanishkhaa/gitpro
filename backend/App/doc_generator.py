import requests
from typing import List, Dict, Any
from utils import github_api_get, call_groq_api
import logging
import re

logging.basicConfig(level=logging.DEBUG)

def fetch_repo_tree(repo: str, branch: str = "main") -> List[Dict[str, Any]]:
    """
    Fetch the repository tree from GitHub and return a structured file tree.
    """
    branches = [branch, "master"] if branch == "main" else [branch, "main"]
    tree = None
    for b in branches:
        logging.debug(f"Fetching tree for branch {b} in {repo}")
        tree_data = github_api_get(f"/repos/{repo}/git/trees/{b}?recursive=1")
        if tree_data and "tree" in tree_data:
            tree = tree_data["tree"]
            break
    if not tree:
        logging.error(f"Could not fetch repository tree for {repo}.")
        return []

    logging.debug(f"Fetched {len(tree)} items from repository tree")

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
                file_tree.append({
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

    logging.debug(f"Processed file tree with {len(file_tree)} files")
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
        ".html": "javascript",
        ".css": "css",
        ".json": "json",
        ".md": "markdown",
        ".png": "image",
        ".jpg": "image",
        ".jpeg": "image"
    }
    for ext, lang in extension_map.items():
        if filename.lower().endswith(ext):
            return lang
    return "unknown"

def fetch_file_content(repo: str, path: str, branch: str = "main") -> str:
    """
    Fetch the content of a file from the GitHub repository.
    """
    branches = [branch, "master"] if branch == "main" else [branch, "main"]
    for b in branches:
        raw_url = f"https://raw.githubusercontent.com/{repo}/{b}/{path}"
        logging.debug(f"Fetching content from {raw_url}")
        try:
            resp = requests.get(raw_url, timeout=30)
            if resp.status_code == 200:
                return resp.text
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to fetch content for {path} from branch {b}: {str(e)}")
            continue
    return ""

def extract_functions_from_markdown(markdown: str, file_path: str) -> List[Dict[str, str]]:
    """
    Extract function/class/component details from markdown documentation.
    """
    try:
        functions = []
        component_section = re.search(r'## Main Components\s*([\s\S]*?)(?=\n## |\Z)', markdown, re.MULTILINE)
        if component_section:
            component_content = component_section.group(1)
            matches = re.finditer(r'###\s*([^\n(]+)\(?(.*?)\)?\s*(.*?)(?=(###|\Z))', component_content, re.MULTILINE | re.DOTALL)
            for match in matches:
                name = match.group(1).strip()
                params = match.group(2).strip().split(", ") if match.group(2).strip() else []
                description = re.search(r'Description:\s*(.*?)(?=\n\n|\Z)', match.group(3), re.DOTALL)
                description = description.group(1).strip() if description else "No description provided"
                example_match = re.search(r'Example:\s*```[\w]*\n(.*?)\n```', match.group(3), re.DOTALL)
                example = example_match.group(1).strip() if example_match else ""
                functions.append({
                    "name": name,
                    "params": params,
                    "description": description,
                    "example": example
                })
        return functions
    except Exception as e:
        logging.error(f"Error extracting components from markdown for {file_path}: {str(e)}")
        return []

def generate_docs(repo: str, max_files: int = 10) -> Dict[str, Any]:
    """
    Generate documentation for all relevant files in a GitHub repository.
    Returns a JSON-compatible dictionary with documentation details.
    """
    files = fetch_repo_tree(repo)
    if not files:
        logging.info(f"No files found for {repo}.")
        return {"error": "No files found in repository", "docs": [], "repo": repo}

    docs = []
    file_count = 0
    for file in files:
        if file["type"] != "file" or file_count >= max_files:
            continue
        path = file["path"]
        language = file["language"]

        logging.debug(f"Processing file {path} with language {language}")

        # Process all code and image files
        if language == "unknown" and not path.lower().endswith((".png", ".jpg", ".jpeg")):
            logging.debug(f"Skipping unknown file type: {path}")
            continue

        content = fetch_file_content(repo, path) if language != "image" else ""
        if not content and language != "image":
            logging.error(f"Failed to fetch content for {path}")
            docs.append({
                "filename": path.split("/")[-1],
                "path": path,
                "language": language,
                "functions": [],
                "documentation": f"Failed to fetch content for {path}",
                "timestamp": "",
                "status": "failed",
                "linesCount": 0
            })
            file_count += 1
            continue

        if language == "image":
            prompt = f"""Generate documentation for the image file '{path}' in repository '{repo}'.
Provide:
1. Purpose: Describe the likely purpose of the image in the project.
2. Main Components: List any notable visual elements or metadata (e.g., image type, dimensions if known).
3. Usage Examples: Describe how the image might be used in the project.
4. Dependencies: List any tools or libraries needed to view or edit the image.
5. Developer Notes: Provide guidance for working with the image.
Use plain text with clear section headings (e.g., ## Purpose, ## Main Components). Avoid markdown symbols like **, *, or backticks."""
        else:
            if len(content) > 3000:
                content = content[:3000] + "\n... (truncated)"

            prompt = f"""Generate comprehensive documentation for the source code file '{path}' in repository '{repo}':
{content}
Provide:
1. Purpose: Describe the file's purpose in the project (2-3 sentences).
2. Main Components: List main functions, classes, or React components with their purposes (include a brief description for each).
3. Usage Examples: Provide example usage of key components (include code snippets in triple backticks ```).
4. Dependencies: List required libraries, frameworks, or external files.
5. Developer Notes: Highlight important considerations for developers.
Use plain text with clear section headings (e.g., ## Purpose, ## Main Components). Avoid markdown symbols like **, *, or backticks."""
        
        try:
            logging.debug(f"Calling Grok API for {path}")
            doc = call_groq_api(prompt)
            if not doc:
                raise ValueError("Empty response from Grok API")

            functions = extract_functions_from_markdown(doc, path) if language != "image" else []
            lines_count = len(content.splitlines()) if content else 0

            docs.append({
                "filename": path.split("/")[-1],
                "path": path,
                "language": language,
                "functions": functions,
                "documentation": doc,
                "timestamp": "",
                "status": "completed",
                "linesCount": lines_count
            })
            file_count += 1
            logging.debug(f"Successfully generated docs for {path}")
        except Exception as e:
            logging.error(f"Error generating docs for {path}: {str(e)}")
            docs.append({
                "filename": path.split("/")[-1],
                "path": path,
                "language": language,
                "functions": [],
                "documentation": f"Failed to generate documentation for {path}: {str(e)}",
                "timestamp": "",
                "status": "failed",
                "linesCount": 0
            })
            file_count += 1

    logging.debug(f"Generated documentation for {len(docs)} files")
    return {"docs": docs, "repo": repo}

if __name__ == "__main__":
    repo = input("Enter GitHub repo (owner/repo): ").strip()
    if not repo or "/" not in repo:
        print("Invalid repository format. Use 'owner/repo'")
    else:
        result = generate_docs(repo)
        for doc in result["docs"]:
            print(f"\nDocumentation for {doc['path']}:\n{doc['documentation']}\n{'=' * 60}")