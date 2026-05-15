import requests

BASE = "http://127.0.0.1:8000/api"

def run():
    users = [
        {
            "email": "smoke_cust@example.com",
            "phone_number": "9000000000",
            "password": "Password123!",
            "first_name": "Smoke",
            "last_name": "Customer",
            "role": "CUSTOMER",
        },
        {
            "email": "smoke_prov@example.com",
            "phone_number": "9000000001",
            "password": "Password123!",
            "first_name": "Smoke",
            "last_name": "Provider",
            "role": "PROVIDER",
        },
    ]

    for u in users:
        r = requests.post(f"{BASE}/auth/register", json=u)
        print("REGISTER", u["email"], r.status_code, r.text)

if __name__ == '__main__':
    run()
