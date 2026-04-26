import { Bell, CalendarDays, Lock, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { bookingService } from "../../services/bookingService";
import { authService } from "../../services/authService";
import { profileService } from "../../services/profileService";
import { useAuthStore } from "../../store/authStore";
import type { Booking, User } from "../../types";

type ProfileForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

const toRoleLabel = (role?: User["role"]) => {
  if (role === "SUPPORT_AGENT") return "Support Agent";
  if (role === "PROVIDER") return "Provider";
  if (role === "ADMIN") return "Admin";
  return "Customer";
};

const toForm = (user: User | null): ProfileForm => ({
  fullName: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
  email: user?.email ?? "",
  phoneNumber: user?.phone_number ?? "",
});

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, loadProfile, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>(toForm(user));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [profileResponse, bookingsResponse] = await Promise.all([
          profileService.getProfile(),
          bookingService.customerBookings(),
        ]);
        const profileUser = profileResponse.data as User;
        setForm(toForm(profileUser));
        setBookings((bookingsResponse.data ?? []) as Booking[]);
        await loadProfile();
      } catch (error) {
        setErrorMessage((error as Error).message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [loadProfile]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const displayName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Sahāy User";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";

  const bookingSummary = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
    const pending = bookings.filter((booking) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(booking.status)).length;
    return { total, completed, pending };
  }, [bookings]);

  const onEdit = () => {
    setEditing(true);
    setShowPasswordForm(false);
    setForm(toForm(user));
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const onCancel = () => {
    setEditing(false);
    setForm(toForm(user));
    setErrorMessage(null);
  };

  const openPhoneEdit = () => {
    setEditing(true);
    setShowPasswordForm(false);
    setInfoMessage(null);
    document.getElementById("personal-information")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openPasswordForm = () => {
    setShowPasswordForm(true);
    setEditing(false);
    setInfoMessage(null);
    document.getElementById("security-settings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openNotifications = () => {
    navigate("/notifications");
  };

  const handlePasswordChange = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim() || !passwordForm.confirmPassword.trim()) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await authService.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setToastMessage("Password changed successfully.");
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const onSave = async () => {
    setErrorMessage(null);
    const trimmedName = form.fullName.trim();
    if (!trimmedName) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }

    const { firstName, lastName } = splitName(trimmedName);
    if (!firstName) {
      setErrorMessage("Please provide a valid full name.");
      return;
    }

    setSaving(true);
    try {
      await profileService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: form.email.trim(),
        phone_number: form.phoneNumber.trim(),
      });
      await loadProfile();
      setEditing(false);
      setToastMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      {toastMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 shadow-sm">
          {toastMessage}
        </div>
      )}

      <Card className="rounded-xl p-6 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
              {avatarLetter}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onEdit}>Edit Profile</Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="personal-information" className="rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</p>
              {editing ? (
                <Input
                  value={form.fullName}
                  onChange={(event) => setForm((state) => ({ ...state, fullName: event.target.value }))}
                />
              ) : (
                <p className="text-sm text-slate-700">{displayName}</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
              {editing ? (
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                />
              ) : (
                <p className="text-sm text-slate-700">{user?.email || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</p>
              {editing ? (
                <Input
                  value={form.phoneNumber}
                  onChange={(event) => setForm((state) => ({ ...state, phoneNumber: event.target.value }))}
                />
              ) : (
                <p className="text-sm text-slate-700">{user?.phone_number || "N/A"}</p>
              )}
            </div>
          </div>
          {errorMessage && <p className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-700">{errorMessage}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={onEdit}>Edit Profile</Button>
            )}
          </div>
        </Card>

        <Card className="rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account Overview</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <UserRound className="h-4 w-4 text-slate-500" />
              <span>Role: {toRoleLabel(user?.role)}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <span>Member since: {formatDate(user?.created_at)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>Phone verified: {user?.phone_number ? "Yes" : "No"}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={openPasswordForm}
            >
              <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Change password</span>
              <span>Open</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={openPhoneEdit}
            >
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Update phone number</span>
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={openNotifications}
            >
              <span className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notification preferences</span>
              <span>Manage</span>
            </button>
          </div>
          {infoMessage && <p className="mt-3 rounded-lg bg-sky-50 p-2 text-sm text-sky-700">{infoMessage}</p>}
        </Card>

        <Card className="rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Booking Summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total bookings</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{bookingSummary.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Completed services</p>
              <p className="mt-2 text-2xl font-bold text-emerald-800">{bookingSummary.completed}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-700">Pending services</p>
              <p className="mt-2 text-2xl font-bold text-amber-800">{bookingSummary.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card id="security-settings" className="rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={openPasswordForm}
          >
            <ShieldCheck className="h-4 w-4" /> Change password
          </Button>
          <Button
            variant="danger"
            className="gap-2"
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            <Lock className="h-4 w-4" /> Logout
          </Button>
        </div>

        {showPasswordForm && (
          <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Change password</p>
              <p className="text-xs text-slate-500">Enter your current password and choose a new one.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, currentPassword: event.target.value }))}
              />
              <Input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, confirmPassword: event.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handlePasswordChange()} disabled={passwordSaving}>
                {passwordSaving ? "Saving..." : "Update password"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                disabled={passwordSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}