from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Meridian Security Scanner Service"

if __name__ == "__main__":
    app.run(port=8002)
