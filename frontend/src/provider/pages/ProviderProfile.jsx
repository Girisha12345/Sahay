import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Globe, Mail, Phone, Sparkles, Star, UserRound, X } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { authService } from "../../services/authService";

const createEmptyForm = () => ({
  fullName: "",
  phoneNumber: "",
  skills: "",
  experienceYears: "",
  certificates: "",
  serviceAreas: "",
  languagesKnown: "",
});

const joinList = (values) => (Array.isArray(values) ? values.filter(Boolean).join(", ") : "");

const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildForm = (profile) => {
  const user = profile?.user || {};
  return {
    fullName: [user.first_name, user.last_name].filter(Boolean).join(" ").trim(),
    phoneNumber: user.phone_number || "",
    skills: joinList(profile?.skills),
    experienceYears: String(profile?.experience_years ?? ""),
    certificates: joinList(profile?.certificates),
    serviceAreas: joinList(profile?.service_areas),
    languagesKnown: joinList(profile?.languages_known),
  };
};

const fieldBase =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200";

export function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(createEmptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await authService.getProviderDashboard();
        const nextProfile = data?.profile || null;
        setProfile(nextProfile);
        setForm(buildForm(nextProfile));
      } catch (loadError) {
        setError(loadError?.message || "Unable to load provider profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const displayName = profile?.user
    ? [profile.user.first_name, profile.user.last_name].filter(Boolean).join(" ").trim()
    : form.fullName || "Provider";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "P";
  const verificationStatus = profile?.verification_status || "PENDING";

  const derivedStats = useMemo(
    () => [
      { label: "Skills", value: splitList(form.skills).length || profile?.skills?.length || 0 },
      { label: "Service areas", value: splitList(form.serviceAreas).length || profile?.service_areas?.length || 0 },
      { label: "Languages", value: splitList(form.languagesKnown).length || profile?.languages_known?.length || 0 },
      { label: "Experience", value: `${form.experienceYears || profile?.experience_years || 0} yrs` },
    ],
    [form, profile],
  );

  const resetToProfile = () => {
    setForm(buildForm(profile));
    setFieldErrors({});
    setError("");
    setMessage("");
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^\d{10}$/.test(form.phoneNumber.trim())) nextErrors.phoneNumber = "Phone number must be 10 digits.";
    const experienceYears = Number(form.experienceYears);
    if (!Number.isFinite(experienceYears) || experienceYears <= 0) {
      nextErrors.experienceYears = "Experience must be a positive number.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const { data } = await authService.updateProviderProfile({
        full_name: form.fullName.trim(),
        phone_number: form.phoneNumber.trim(),
        skills: splitList(form.skills),
        experience_years: Number(form.experienceYears),
        certificates: splitList(form.certificates),
        service_areas: splitList(form.serviceAreas),
        languages_known: splitList(form.languagesKnown),
      });

      const updatedProfile = data?.profile || profile;
      setProfile(updatedProfile);
      setForm(buildForm(updatedProfile));
      setIsEditing(false);
      setMessage(data?.detail || "Profile updated successfully.");
      setFieldErrors({});
    } catch (saveError) {
      setError(saveError?.message || "Unable to save provider profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetToProfile();
  };

  const renderValue = (label, value) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value || "Not added"}</p>
    </div>
  );

  const renderInput = (label, field, value, onChange, type = "text", placeholder = "") => (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={fieldBase}
      />
      {fieldErrors[field] && <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors[field]}</p>}
    </div>
  );

  if (loading) {
    return (
      <ProviderLayout title="Provider Profile" subtitle="Manage your professional identity">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="Provider Profile" subtitle="Manage your professional identity">
      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <Card className="overflow-hidden p-0 shadow-lg">
          <div className="bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 px-6 py-6 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-3xl font-bold text-white ring-1 ring-white/20 backdrop-blur">
                  {avatarLetter}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">Provider identity</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{displayName}</h1>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-cyan-50">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                      <Mail className="h-4 w-4" />
                      {profile?.user?.email || "No email"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                      <Phone className="h-4 w-4" />
                      {profile?.user?.phone_number || form.phoneNumber || "No phone"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                      <BadgeCheck className="h-4 w-4" />
                      {verificationStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                {isEditing ? (
                  <>
                    <Button type="button" variant="secondary" className="gap-2" onClick={handleCancel} disabled={saving}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="secondary" className="gap-2" onClick={() => setIsEditing(true)}>
                    <Sparkles className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {derivedStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-sky-600" />
                  <h2 className="text-base font-semibold text-slate-900">Core Details</h2>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {renderInput("Full Name", "fullName", form.fullName, (event) => setForm((state) => ({ ...state, fullName: event.target.value })), "text", "Rajesh Kumar")}
                    {renderInput("Phone Number", "phoneNumber", form.phoneNumber, (event) => setForm((state) => ({ ...state, phoneNumber: event.target.value })), "text", "9876543210")}
                    {renderInput("Experience (Years)", "experienceYears", form.experienceYears, (event) => setForm((state) => ({ ...state, experienceYears: event.target.value })), "number", "6")}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {renderValue("Full Name", displayName)}
                    {renderValue("Phone Number", profile?.user?.phone_number || form.phoneNumber)}
                    {renderValue("Email", profile?.user?.email)}
                    {renderValue("Experience", `${profile?.experience_years ?? form.experienceYears ?? 0} years`)}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-sky-600" />
                  <h2 className="text-base font-semibold text-slate-900">Professional Details</h2>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</label>
                      <Input
                        value={form.skills}
                        onChange={(event) => setForm((state) => ({ ...state, skills: event.target.value }))}
                        placeholder="Plumbing, Electrical, Appliance Repair"
                        className={fieldBase}
                      />
                      <p className="mt-2 text-xs text-slate-500">Use comma separated values.</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Certificates</label>
                      <textarea
                        value={form.certificates}
                        onChange={(event) => setForm((state) => ({ ...state, certificates: event.target.value }))}
                        placeholder="Licensed Electrical Technician, Plumbing Safety Certificate"
                        className="min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      />
                      <p className="mt-2 text-xs text-slate-500">Certificates or licenses displayed on your profile.</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Service Areas</label>
                      <Input
                        value={form.serviceAreas}
                        onChange={(event) => setForm((state) => ({ ...state, serviceAreas: event.target.value }))}
                        placeholder="JP Nagar, HSR Layout, Jayanagar"
                        className={fieldBase}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Languages Known</label>
                      <Input
                        value={form.languagesKnown}
                        onChange={(event) => setForm((state) => ({ ...state, languagesKnown: event.target.value }))}
                        placeholder="English, Hindi, Kannada"
                        className={fieldBase}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {renderValue("Skills", joinList(profile?.skills) || form.skills)}
                    {renderValue("Certificates", joinList(profile?.certificates) || form.certificates)}
                    {renderValue("Service Areas", joinList(profile?.service_areas) || form.serviceAreas)}
                    {renderValue("Languages Known", joinList(profile?.languages_known) || form.languagesKnown)}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Professional visibility</p>
                  <p className="text-sm text-slate-500">
                    Keep your profile accurate so customers see your current expertise, service radius, and credentials.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Star className="h-4 w-4 text-amber-500" />
                  Rating {profile?.rating || 0}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </ProviderLayout>
  );
}
