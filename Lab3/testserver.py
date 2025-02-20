from flask import Flask, request
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

app = Flask(__name__)

@app.route("/api")
def api():
    if "wsgi.websocket" in request.environ:
        ws = request.environ["wsgi.websocket"]
        print("✅ WebSocket connection established!")

        while True:
            message = ws.receive()
            if message:
                print(f"Received message: {message}")
                ws.send(f"Echo: {message}")  # Send message back to client
    return "WebSocket connection required", 400  # Reject non-WebSocket requests

if __name__ == "__main__":
    server = pywsgi.WSGIServer(("127.0.0.1", 5000), app, handler_class=WebSocketHandler)
    print("🚀 WebSocket server running on ws://127.0.0.1:5000/api")
    server.serve_forever()
