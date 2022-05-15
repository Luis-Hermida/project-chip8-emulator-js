import os
import http.server
import socketserver

PORT = int(os.environ.get('PORT', 8080))

handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print("Server started at localhost:" + str(PORT))
    httpd.serve_forever()