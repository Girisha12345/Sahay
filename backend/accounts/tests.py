from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class LoginAPITests(APITestCase):
	def setUp(self):
		self.password = "SecurePass123!"
		self.user = User.objects.create_user(
			email="test@example.com",
			phone_number="9876543210",
			password=self.password,
			first_name="Test",
			last_name="User",
		)
		self.login_url = reverse("login")

	def test_password_is_hashed_on_create_user(self):
		self.assertNotEqual(self.user.password, self.password)
		self.assertTrue(self.user.check_password(self.password))

	def test_login_returns_access_and_refresh_tokens(self):
		response = self.client.post(
			self.login_url,
			{"email": self.user.email, "password": self.password},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)

	def test_login_with_invalid_credentials_returns_400(self):
		response = self.client.post(
			self.login_url,
			{"email": self.user.email, "password": "wrong-password"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data, {"error": "Invalid credentials"})
