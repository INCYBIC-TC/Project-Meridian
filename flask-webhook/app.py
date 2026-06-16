from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Meridian Flask Webhook Handler"

if __name__ == "__main__":
    app.run(port=8001)
