from accounts.models import User


def mask_sensitive_data(user: User, reveal_contact: bool = False) -> dict:
    phone_number = user.phone_number or ""
    email = user.email or ""
    masked_phone = f"{'X' * max(len(phone_number) - 4, 0)}{phone_number[-4:]}" if phone_number else ""
    email_user, _, email_domain = email.partition("@")
    masked_email = f"{email_user[:1]}***@{email_domain}" if email_domain else email

    data = {
        "id": str(user.id),
        "first_name": user.first_name,
        "rating": getattr(getattr(user, "provider_profile", None), "rating", None),
        "completed_jobs": getattr(user, "completed_jobs_count", 0),
        "city": getattr(getattr(user, "provider_profile", None), "city", ""),
    }

    if reveal_contact:
        data.update(
            {
                "email": masked_email,
                "phone_number": masked_phone,
            }
        )
    else:
        data.update(
            {
                "email": None,
                "phone_number": None,
            }
        )

    data["last_name"] = None

    return data
