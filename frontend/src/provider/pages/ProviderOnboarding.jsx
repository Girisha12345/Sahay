import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { providerService } from "../../services/providerService";
import { ProviderLayout } from "../components/ProviderLayout";

const steps = [
  {
    title: "Basic Information",
    description: "Tell customers who you are and how to reach you.",
  },
  {
    title: "Work Experience",
    description: "Share your skills, years of experience, city, and languages.",
  },
  {
    title: "Certificates",
    description: "Upload licenses or add certificate details to build trust.",
  },
  {
    title: "Identity Verification",
    description: "Upload identity documents for verification review.",
  },
  {
    title: "Bank Details",
    description: "Add payout details to receive earnings.",
  },
  {
    title: "Review & Submit",
    description: "Save your progress or submit the onboarding form.",
  },
];

const initialForm = {
  full_name: "",
  phone_number: "",
  skills: "",
  experience_years: "",
  city: "",
  languages_known: "",
  certificate_notes: "",
  identity_notes: "",
  bank_name: "",
  account_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
};

const parseList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function ProviderOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [identityFiles, setIdentityFiles] = useState([]);
  const [profileState, setProfileState] = useState({
    certificates: [],
    identity_documents: [],
    bank_details: {},
    onboarding_step: 1,
    onboarding_completed: false,
  });

  const completion = useMemo(() => Math.round(((currentStep + 1) / steps.length) * 100), [currentStep]);
  const providerFlagKey = `provider_onboarding_done_${localStorage.getItem("accessToken") || "default"}`;

  useEffect(() => {
    let mounted = true;

    providerService
      .getOnboarding()
      .then(({ data }) => {
        if (!mounted) return;

        const fullName = [data.user?.first_name, data.user?.last_name].filter(Boolean).join(" ");
        setForm({
          full_name: fullName,
          phone_number: data.user?.phone_number || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          experience_years: data.experience_years ? String(data.experience_years) : "",
          city: data.city || data.service_areas?.[0] || "",
          languages_known: Array.isArray(data.languages_known) ? data.languages_known.join(", ") : "",
          certificate_notes: Array.isArray(data.certificates) ? data.certificates.join("\n") : "",
          identity_notes: Array.isArray(data.identity_documents) ? data.identity_documents.join("\n") : "",
          bank_name: data.bank_details?.bank_name || "",
          account_name: data.bank_details?.account_name || "",
          account_number: data.bank_details?.account_number || "",
          ifsc_code: data.bank_details?.ifsc_code || "",
          upi_id: data.bank_details?.upi_id || "",
        });
        setProfileState({
          certificates: Array.isArray(data.certificates) ? data.certificates : [],
          identity_documents: Array.isArray(data.identity_documents) ? data.identity_documents : [],
          bank_details: data.bank_details || {},
          onboarding_step: data.onboarding_step || 1,
          onboarding_completed: Boolean(data.onboarding_completed),
        });
        setCurrentStep(Math.min(Math.max((data.onboarding_step || 1) - 1, 0), steps.length - 1));
      })
      .catch((error) => {
        setMessage(error?.message || "Unable to load onboarding data.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveStep = async ({ advance = true, submit = false } = {}) => {
    setSaving(true);
    setMessage("");

    try {
      let certificates = profileState.certificates;
      let identityDocuments = profileState.identity_documents;

      if (currentStep === 2 && certificateFiles.length > 0) {
        const response = await providerService.uploadOnboardingFiles(certificateFiles, "certificates");
        certificates = [...certificates, ...(response.data.files || [])];
      }

      if (currentStep === 3 && identityFiles.length > 0) {
        const response = await providerService.uploadOnboardingFiles(identityFiles, "identity");
        identityDocuments = [...identityDocuments, ...(response.data.files || [])];
      }

      const payload = {
        full_name: form.full_name,
        phone_number: form.phone_number,
        skills: parseList(form.skills),
        experience_years: Number.parseInt(form.experience_years || "0", 10) || 0,
        city: form.city,
        languages_known: parseList(form.languages_known),
        certificates,
        identity_documents: identityDocuments,
        bank_details: {
          bank_name: form.bank_name,
          account_name: form.account_name,
          account_number: form.account_number,
          ifsc_code: form.ifsc_code,
          upi_id: form.upi_id,
        },
        onboarding_step: currentStep + 1,
        submit,
      };

      const response = await providerService.saveOnboarding(payload);
      const nextProfile = response.data.profile;

      setProfileState({
        certificates: Array.isArray(nextProfile.certificates) ? nextProfile.certificates : certificates,
        identity_documents: Array.isArray(nextProfile.identity_documents) ? nextProfile.identity_documents : identityDocuments,
        bank_details: nextProfile.bank_details || payload.bank_details,
        onboarding_step: nextProfile.onboarding_step || currentStep + 1,
        onboarding_completed: Boolean(nextProfile.onboarding_completed),
      });

      localStorage.setItem(providerFlagKey, "true");
      setMessage(submit ? "Onboarding submitted successfully." : "Step saved successfully.");

      if (submit) {
        navigate("/provider/dashboard", { replace: true });
        return;
      }

      if (advance) {
        setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
      }
    } catch (error) {
      setMessage(error?.message || "Failed to save onboarding. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.full_name} onChange={(value) => updateForm("full_name", value)} placeholder="John Doe" />
            <Field label="Phone number" value={form.phone_number} onChange={(value) => updateForm("phone_number", value)} placeholder="9876543210" />
          </div>
        );
      case 1:
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Skills & expertise" value={form.skills} onChange={(value) => updateForm("skills", value)} placeholder="Plumbing, Electrical, Home Repair" />
            <Field label="Experience (years)" type="number" value={form.experience_years} onChange={(value) => updateForm("experience_years", value)} placeholder="3" />
            <Field label="Service city" value={form.city} onChange={(value) => updateForm("city", value)} placeholder="Bengaluru, Karnataka" />
            <Field label="Languages known" value={form.languages_known} onChange={(value) => updateForm("languages_known", value)} placeholder="English, Hindi, Kannada" />
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-sm font-medium text-slate-700">Certificates & license notes</label>
              <textarea
                className="mt-2 min-h-40 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={form.certificate_notes}
                onChange={(event) => updateForm("certificate_notes", event.target.value)}
                placeholder="Enter license numbers, certifications, or professional qualifications."
              />
            </div>
            <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-4">
              <label className="block text-sm font-medium text-slate-700">Upload certificates</label>
              <p className="mt-1 text-sm text-slate-500">PDF, JPG, PNG up to 5MB each.</p>
              <input
                className="mt-4 block w-full text-sm text-slate-600"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setCertificateFiles(Array.from(event.target.files || []))}
              />
              <p className="mt-3 text-xs text-slate-500">Selected files: {certificateFiles.length}</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-sm font-medium text-slate-700">Identity verification notes</label>
              <textarea
                className="mt-2 min-h-40 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={form.identity_notes}
                onChange={(event) => updateForm("identity_notes", event.target.value)}
                placeholder="Add Aadhaar, PAN, or any verification details if needed."
              />
            </div>
            <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-4">
              <label className="block text-sm font-medium text-slate-700">Upload identity documents</label>
              <p className="mt-1 text-sm text-slate-500">These are used for admin review and verification.</p>
              <input
                className="mt-4 block w-full text-sm text-slate-600"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setIdentityFiles(Array.from(event.target.files || []))}
              />
              <p className="mt-3 text-xs text-slate-500">Selected files: {identityFiles.length}</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank name" value={form.bank_name} onChange={(value) => updateForm("bank_name", value)} placeholder="HDFC Bank" />
            <Field label="Account holder name" value={form.account_name} onChange={(value) => updateForm("account_name", value)} placeholder="John Doe" />
            <Field label="Account number" value={form.account_number} onChange={(value) => updateForm("account_number", value)} placeholder="1234567890" />
            <Field label="IFSC code" value={form.ifsc_code} onChange={(value) => updateForm("ifsc_code", value)} placeholder="HDFC0001234" />
            <Field label="UPI ID" value={form.upi_id} onChange={(value) => updateForm("upi_id", value)} placeholder="john@upi" />
          </div>
        );
      default:
        return (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>Review the information below before submitting:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryItem label="Full name" value={form.full_name} />
              <SummaryItem label="Phone number" value={form.phone_number} />
              <SummaryItem label="Skills" value={form.skills} />
              <SummaryItem label="Experience" value={form.experience_years} />
              <SummaryItem label="City" value={form.city} />
              <SummaryItem label="Languages" value={form.languages_known} />
              <SummaryItem label="Certificates uploaded" value={String(profileState.certificates.length)} />
              <SummaryItem label="Identity docs uploaded" value={String(profileState.identity_documents.length)} />
              <SummaryItem label="Bank" value={form.bank_name} />
              <SummaryItem label="UPI" value={form.upi_id} />
            </div>
          </div>
        );
    }
  };

  return (
    <ProviderLayout title="Provider Onboarding" subtitle="Complete your profile to start receiving jobs and build trust with customers.">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-sm font-semibold text-slate-700">Onboarding Progress</p>
              <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full border-8 border-slate-200 border-t-blue-500">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{completion}%</div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {steps.map((step, index) => {
                const active = index === currentStep;
                const done = index < currentStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${done || active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Your information is secure</p>
              <p className="mt-1 text-blue-800/80">We only use these details to verify your profile and improve booking trust.</p>
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{steps[currentStep].title}</h2>
                <p className="mt-1 text-sm text-slate-500">{steps[currentStep].description}</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Step {currentStep + 1} of {steps.length}</div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Loading onboarding form...</div>
            ) : (
              <>
                {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
                <form onSubmit={(event) => {
                  event.preventDefault();
                  void saveStep({ advance: currentStep < steps.length - 1, submit: currentStep === steps.length - 1 });
                }} className="space-y-6">
                  {renderStepContent()}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={() => saveStep({ advance: false, submit: false })}
                      disabled={saving}
                      className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Save as Draft
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/provider/dashboard", { replace: true })}
                        className="rounded-xl px-5 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Skip for now
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                      >
                        {saving ? "Saving..." : currentStep === steps.length - 1 ? "Submit Onboarding" : "Continue"}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </ProviderLayout>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
      />
    </label>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value || "Not set"}</div>
    </div>
  );
}
