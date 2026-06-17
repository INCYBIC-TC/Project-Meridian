import os
import shutil
import ast
import re
import time
from fastapi import FastAPI
from pydantic import BaseModel
from git import Repo

app = FastAPI(title="Meridian Parser Service")

class RepoPayload(BaseModel):
    repo_name: str
    clone_url: str

TEMP_DIR = os.path.join(os.getcwd(), "temp_repos")

def parse_python_file(file_path):
    """Uses Abstract Syntax Trees (AST) to extract classes and functions."""
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            node = ast.parse(f.read(), filename=file_path)
        except SyntaxError:
            return None

    file_metadata = {"classes": [], "functions": []}

    for item in node.body:
        if isinstance(item, ast.FunctionDef):
            args = [arg.arg for arg in item.args.args]
            file_metadata["functions"].append({
                "name": item.name,
                "arguments": args,
                "docstring": ast.get_docstring(item) or ""
            })
        
        elif isinstance(item, ast.ClassDef):
            class_methods = []
            for sub_item in item.body:
                if isinstance(sub_item, ast.FunctionDef):
                    sub_args = [arg.arg for arg in sub_item.args.args]
                    class_methods.append({
                        "name": sub_item.name,
                        "arguments": sub_args,
                        "docstring": ast.get_docstring(sub_item) or ""
                    })
            
            file_metadata["classes"].append({
                "name": item.name,
                "methods": class_methods,
                "docstring": ast.get_docstring(item) or ""
            })

    return file_metadata


def parse_javascript_file(file_path):
    """Uses Regex signatures to parse JS/JSX functions and React components."""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    file_metadata = {"classes": [], "functions": []}

    # 1. Match standard declarations: function functionName(abc, xyz)
    standard_funcs = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)', content)
    for name, args_str in standard_funcs:
        args = [a.strip() for a in args_str.split(",") if a.strip()]
        file_metadata["functions"].append({
            "name": name,
            "arguments": args,
            "type": "Standard Function"
        })

    # 2. Match Arrow Functions/React Functional Components: const MyComponent = (props) =>
    arrow_funcs = re.findall(r'(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>', content)
    for _, name, args_str in arrow_funcs:
        args = [a.strip() for a in args_str.split(",") if a.strip()]
        file_metadata["functions"].append({
            "name": name,
            "arguments": args,
            "type": "Arrow Function / React Component"
        })

    # 3. Match ES6 JavaScript Classes
    classes = re.findall(r'class\s+([a-zA-Z0-9_]+)', content)
    for class_name in classes:
        file_metadata["classes"].append({
            "name": class_name,
            "methods": [],
            "type": "ES6 Class"
        })

    return file_metadata


@app.post("/parse")
def parse_repository(payload: RepoPayload):
    # Generates a completely unique folder path using an epoch timestamp string
    unique_repo_name = f"{payload.repo_name}_{int(time.time())}"
    repo_path = os.path.join(TEMP_DIR, unique_repo_name)
    
    if os.path.exists(repo_path):
        shutil.rmtree(repo_path, ignore_errors=True)
        
    print(f"📥 Cloning repository: {payload.repo_name} into unique folder {unique_repo_name}...")
    try:
        Repo.clone_from(payload.clone_url, repo_path, depth=1)
    except Exception as e:
        return {"status": "failed", "error": f"Failed to clone repository: {str(e)}"}

    print(f"🔍 Parsing code structure...")
    analysis_results = {}

    for root, _, files in os.walk(repo_path):
        for file in files:
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, repo_path)
            
            file_data = None
            if file.endswith(".py"):
                file_data = parse_python_file(full_path)
            elif file.endswith(".js") or file.endswith(".jsx"):
                file_data = parse_javascript_file(full_path)
                
            if file_data and (file_data["classes"] or file_data["functions"]):
                analysis_results[relative_path] = file_data

    # Immediate post-scan storage cleanup
    shutil.rmtree(repo_path, ignore_errors=True)

    return {
        "status": "success",
        "repository": payload.repo_name,
        "analysis": analysis_results
    }
