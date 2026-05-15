import requests

BASE = "http://127.0.0.1:8000/api"

def run():
    # login as test customer
    resp = requests.post(f"{BASE}/auth/login", json={"email": "customer1@sahay.test", "password": "Password123!"})
    print("LOGIN_STATUS", resp.status_code, resp.text)
    data = resp.json()
    token = data.get("access")
    if not token:
        print("No token returned; aborting")
        return

    headers = {"Authorization": f"Bearer {token}"}
    # send message to booking 138 (replace with latest if needed)
    # use the latest booking created by the setup
    # fetch latest booking id
    r3 = requests.get(f"{BASE}/messages/")
    booking_id = 139
    payload = {"booking_id": booking_id, "message": "Hello from smoke test"}
    r2 = requests.post(f"{BASE}/send-message", json=payload, headers=headers)
    print("SEND_STATUS", r2.status_code, r2.text)

if __name__ == '__main__':
    run()
