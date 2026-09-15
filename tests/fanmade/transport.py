#!/usr/bin/env python3
"""Run the Android transport host harness with an isolated HTTP/TLS fixture."""
import os
from pathlib import Path
import ssl
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        self.send_response(403 if self.path == '/forbidden' else 200)
        self.send_header('Content-Length', '4')
        self.end_headers()
        self.wfile.write(b'test')


with tempfile.TemporaryDirectory(prefix='ourtaiko-transport-') as directory:
    root = Path(directory)
    cert, key = root / 'cert.pem', root / 'key.pem'
    subprocess.run([
        'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
        '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost',
        '-keyout', str(key), '-out', str(cert),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    http = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    https = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    tls.load_cert_chain(cert, key)
    https.socket = tls.wrap_socket(https.socket, server_side=True)
    for server in (http, https):
        threading.Thread(target=server.serve_forever, daemon=True).start()

    def check(base, expected, ca=cert, path='/', limit=4):
        env = dict(os.environ, FANMADE_TEST_CA=str(ca))
        subprocess.run([sys.argv[1], base, path, expected, str(limit)], env=env, check=True)

    try:
        base = f'http://127.0.0.1:{http.server_port}'
        check(base, 'OK')  # The exact byte limit is allowed.
        check(base, 'RESPONSE_SIZE_LIMIT_EXCEEDED', limit=3)
        check(base, 'HTTP_403', path='/forbidden')
        check(base, 'DOWNLOAD_CANCELLED')
        secure = f'https://localhost:{https.server_port}'
        check(secure, 'OK')  # Explicit trusted CA succeeds.
        check(f'https://127.0.0.1:{https.server_port}', 'TLS_CERTIFICATE_VERIFY_FAILED')
        bundled = Path(__file__).resolve().parents[2] / 'android/app/src/main/assets/cacert.pem'
        check(secure, 'TLS_CERTIFICATE_VERIFY_FAILED', ca=bundled)  # Untrusted issuer.
        check(secure, 'TLS_CA_BUNDLE_MISSING', ca=root / 'missing.pem')
        invalid = root / 'invalid.pem'
        invalid.write_text('not a certificate')
        check(secure, 'TLS_CA_BUNDLE_INVALID', ca=invalid)
        invalid.write_text('')
        check(secure, 'TLS_CA_BUNDLE_INVALID', ca=invalid)
    finally:
        for server in (http, https):
            server.shutdown()
            server.server_close()
