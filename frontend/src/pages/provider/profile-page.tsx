import { useEffect, useState } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { authService } from "../../services/authService";

export function ProviderProfilePage() {
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProviderProfile = async () => {
      setLoading(true);
      try {
        const { data } = await authService.getProviderDashboard();
        const profile = data?.profile;
        setSkills((profile?.skills || []).join(", "));
        setExperienceYears(Number(profile?.experience_years || 0));
        setHourlyRate(Number(profile?.hourly_rate || 0));
      } finally {
        setLoading(false);
      }
    };

    void loadProviderProfile();
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await authService.updateProviderProfile({
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        experience_years: Number(experienceYears),
        hourly_rate: Number(hourlyRate),
      });
      setMessage("Profile updated successfully.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Card className="max-w-2xl">
        <h1 className="text-2xl font-bold">Provider Profile</h1>
      <p className="mt-2 text-sm text-slate-500">Update skills, experience and hourly rate from this page.</p>
      {loading && <p className="mt-2 text-sm text-slate-500">Loading profile...</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          className="h-11 rounded-xl border border-slate-300 px-3 md:col-span-2"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
        />
        <input
          className="h-11 rounded-xl border border-slate-300 px-3"
          placeholder="Experience (years)"
          type="number"
          value={experienceYears}
          onChange={(event) => setExperienceYears(Number(event.target.value))}
        />
        <input
          className="h-11 rounded-xl border border-slate-300 px-3"
          placeholder="Hourly Rate"
          type="number"
          value={hourlyRate}
          onChange={(event) => setHourlyRate(Number(event.target.value))}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={() => void onSave()} disabled={saving || loading}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
        {message && <span className="text-sm text-emerald-700">{message}</span>}
      </div>
    </Card>
    </div>
  );
}
