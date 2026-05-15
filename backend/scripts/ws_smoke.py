import json
import time
from urllib.parse import urlencode

import requests
from websocket import create_connection

BASE = "http://127.0.0.1:8001/api"
WS_BASE = "ws://127.0.0.1:8001/ws/chat/139/"


def login(email: str, password: str) -> str:
    response = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password}, timeout=15)
    response.raise_for_status()
    return response.json()["access"]


def read_messages(ws, timeout=3.0):
    deadline = time.time() + timeout
    items = []
    while time.time() < deadline:
        ws.settimeout(max(0.1, deadline - time.time()))
        try:
            raw = ws.recv()
        except Exception:
            break
        if not raw:
            continue
        msg = json.loads(raw)
        items.append(msg)
        if msg.get("type") in {"message", "read"}:
            break
    return items


def main():
    customer_token = login("customer1@sahay.test", "Password123!")
    provider_token = login("provider1@sahay.test", "Password123!")

    customer_ws = create_connection(f"{WS_BASE}?{urlencode({'token': customer_token})}", timeout=10)
    provider_ws = create_connection(f"{WS_BASE}?{urlencode({'token': provider_token})}", timeout=10)

    try:
        customer_events = read_messages(customer_ws)
        provider_events = read_messages(provider_ws)
        print("CUSTOMER_CONNECT_EVENTS", customer_events)
        print("PROVIDER_CONNECT_EVENTS", provider_events)

        customer_ws.send(json.dumps({"message": "ws smoke hello"}))
        provider_events = read_messages(provider_ws)
        customer_events = read_messages(customer_ws)
        print("PROVIDER_AFTER_SEND", provider_events)
        print("CUSTOMER_AFTER_SEND", customer_events)

        provider_ws.send(json.dumps({"type": "mark_read"}))
        provider_events = read_messages(provider_ws)
        customer_events = read_messages(customer_ws)
        print("PROVIDER_AFTER_MARK_READ", provider_events)
        print("CUSTOMER_AFTER_MARK_READ", customer_events)

    finally:
        try:
            customer_ws.close()
        except Exception:
            pass
        try:
            provider_ws.close()
        except Exception:
            pass


if __name__ == "__main__":
    main()
