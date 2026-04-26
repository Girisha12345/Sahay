import { useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";

import { ProviderLayout } from "../../provider/components/ProviderLayout";
import { providerServiceApi, type ProviderServicePayload } from "../../services/providerServiceApi";
import { serviceService } from "../../services/serviceService";
import type { Category, ServiceItem } from "../../types";

type FormState = {
  title: string;
  description: string;
  category: string;
  base_price: string;
  duration_minutes: string;
  location: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  base_price: "",
  duration_minutes: "60",
  location: "",
  is_active: true,
};

const toFormState = (service: ServiceItem): FormState => ({
  title: service.title || "",
  description: service.description || "",
  category: String(service.category?.id || ""),
  base_price: String(service.base_price ?? ""),
  duration_minutes: String(service.duration_minutes ?? 60),
  location: service.location || "",
  is_active: Boolean(service.is_active),
});

export function ProviderServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const editingService = useMemo(
    () => services.find((item) => item.id === editingServiceId) || null,
    [services, editingServiceId],
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: myServices }, { data: categoryData }] = await Promise.all([
        providerServiceApi.listMyServices(),
        serviceService.getCategories(),
      ]);
      setServices(Array.isArray(myServices) ? myServices : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (loadError) {
      setError((loadError as Error).message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openCreateForm = () => {
    setEditingServiceId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setForm(toFormState(service));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingServiceId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const buildPayload = (): ProviderServicePayload => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: Number(form.category),
    base_price: Number(form.base_price),
    duration_minutes: Number(form.duration_minutes),
    location: form.location.trim(),
    is_active: form.is_active,
  });

  const validateForm = () => {
    if (!form.title.trim()) return "Service title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category) return "Category is required.";
    if (!form.base_price || Number(form.base_price) <= 0) return "Base price must be greater than 0.";
    if (!form.duration_minutes || Number(form.duration_minutes) <= 0) return "Duration must be greater than 0.";
    return "";
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    const payload = buildPayload();

    try {
      if (editingServiceId) {
        await providerServiceApi.updateMyService(editingServiceId, payload);
      } else {
        await providerServiceApi.createMyService(payload);
      }
      await loadData();
      closeForm();
    } catch (saveError) {
      setError((saveError as Error).message || "Unable to save service.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    const shouldDelete = window.confirm("Delete this service?");
    if (!shouldDelete) return;

    setError("");
    try {
      await providerServiceApi.deleteMyService(serviceId);
      setServices((prev) => prev.filter((item) => item.id !== serviceId));
    } catch (deleteError) {
      setError((deleteError as Error).message || "Unable to delete service.");
    }
  };

  const handleToggle = async (serviceId: number) => {
    setError("");
    try {
      const { data } = await providerServiceApi.toggleMyService(serviceId);
      setServices((prev) => prev.map((item) => (item.id === serviceId ? data : item)));
    } catch (toggleError) {
      setError((toggleError as Error).message || "Unable to toggle service status.");
    }
  };

  return (
    <ProviderLayout
      title="My Services"
      subtitle="Create, manage, and optimize your service catalog"
      rightContent={
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      }
    >
      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-base font-semibold text-slate-900">No services yet</h3>
          <p className="mt-1 text-sm text-slate-600">Add your first service to appear in customer search.</p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Create Service
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[16/8] bg-gradient-to-r from-sky-500 to-cyan-500" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{service.title}</h3>
                    <p className="text-xs text-slate-500">{service.category?.name || "Uncategorized"}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      service.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {service.is_active ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Rs {Number(service.base_price).toLocaleString("en-IN")}</p>
                  <p>{service.duration_minutes || 0} mins</p>
                  <p>{service.location || "Location not set"}</p>
                  <p>Rating {Number(service.rating || 0).toFixed(1)} ({service.total_reviews || 0} reviews)</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(service)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(service.id)}
                    className="rounded-lg bg-sky-600 px-2 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    {service.is_active ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingService ? `Edit ${editingService.title}` : "Add Service"}
            </h2>
            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Title
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Category
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Base Price
                <input
                  type="number"
                  min="1"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  value={form.base_price}
                  onChange={(event) => setForm((prev) => ({ ...prev, base_price: event.target.value }))}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  value={form.duration_minutes}
                  onChange={(event) => setForm((prev) => ({ ...prev, duration_minutes: event.target.value }))}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Location
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3"
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Description
                <textarea
                  className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                />
                Active and visible to customers
              </label>

              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
                >
                  {saving ? "Saving..." : editingService ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </ProviderLayout>
  );
}
