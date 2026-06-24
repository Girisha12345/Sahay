import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, OTP

print("=== USERS IN DATABASE ===")
users = User.objects.all()
if not users.exists():
    print("No users found.")
else:
    for u in users:
        print(f"Email: {u.email} | Phone: {u.phone_number} | Full Name: {u.full_name} | Role: {u.role}")

print("\n=== OTP RECORDS IN DATABASE ===")
otps = OTP.objects.all().order_by("-created_at")
if not otps.exists():
    print("No OTP records found.")
else:
    for o in otps:
        print(f"Email/Phone: {o.email_or_phone} | OTP: {o.otp} | Type: {o.otp_type} | Verified: {o.verified} | Created At: {o.created_at}")
