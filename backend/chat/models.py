import re

from django.conf import settings
from django.db import models

from bookings.models import Booking

CONTACT_SHARE_PATTERNS = [
	re.compile(r"\b\d{10}\b"),
	re.compile(r"\b[\w\.-]+@[\w\.-]+\.\w+\b"),
	re.compile(r"\b(instagram|insta|ig|facebook|telegram|whatsapp|wa|wa\.me|t\.me)\b", re.IGNORECASE),
	re.compile(r"https?://|www\.", re.IGNORECASE),
]


def contains_pii(text: str) -> bool:
	"""Returns True if message contains phone, email, or social handle."""
	return any(pattern.search(text or "") for pattern in CONTACT_SHARE_PATTERNS)


class ChatRoom(models.Model):
	booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="chat_room")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"ChatRoom({self.booking_id})"


class Message(models.Model):
	room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
	sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
	content = models.TextField()
	is_flagged = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def save(self, *args, **kwargs):
		self.is_flagged = any(pattern.search(self.content or "") for pattern in CONTACT_SHARE_PATTERNS)
		super().save(*args, **kwargs)

	def __str__(self):
		return f"Message({self.id})"


class FlaggedMessageLog(models.Model):
	booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="flagged_logs")
	sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="flagged_attempts")
	raw_content = models.TextField()
	flagged_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-flagged_at"]

	def __str__(self):
		return f"FlaggedLog(booking={self.booking_id}, sender={self.sender_id})"
