#!/usr/bin/env python3
"""Servidor local estático para previsualizar el portal del libro en http://127.0.0.1:8000."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 8000), handler)
    print("Servidor local activo en: http://127.0.0.1:8000 (Ctrl+C para detener)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
