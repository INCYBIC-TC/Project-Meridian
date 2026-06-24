from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Configured for the internal Docker / Local mapping network
PARSER_SERVICE_URL = "http://127.0.0.1:8000/parse"

@app.route('/webhook/github', methods=['POST'])
def github_webhook():
    payload = request.json
    
    if not payload:
        return jsonify({"error": "Invalid payload"}), 400
    
    # Extract push or pull request hook metadata
    if "repository" in payload:
        repo_name = payload["repository"]["name"]
        clone_url = payload["repository"]["clone_url"]
        
        print(f"📦 Received GitHub Webhook for: {repo_name}")
        
        try:
            # Transfer execution tracking directly to your FastAPI Parser
            response = requests.post(
                PARSER_SERVICE_URL,
                json={"repo_name": repo_name, "clone_url": clone_url}
            )
            return jsonify({
                "status": "Webhook received, forwarded to parser",
                "parser_response": response.json()
            }), 200
        except requests.exceptions.ConnectionError:
            return jsonify({"status": "Webhook operational, but FastAPI Parser Service is offline"}), 502

    return jsonify({"status": "Event recognized but not a target repository action"}), 200

if __name__ == '__main__':
    # Configured on port 8001 to comply with project ecosystem specs
    app.run(port=8001, debug=True)
