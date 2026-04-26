import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import type { AddressItem } from "../../types";

type AddressFormProps = {
  initialData?: Partial<AddressItem>;
  onSubmit: (data: Omit<AddressItem, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: AddressFormProps) {
  const [form, setForm] = useState({
    label: initialData?.label || "",
    full_name: initialData?.full_name || "",
    phone_number: initialData?.phone_number || "",
    address_line: initialData?.address_line || "",
    area: initialData?.area || "",
    city: initialData?.city || "",
    pin_code: initialData?.pin_code || "",
    is_default: initialData?.is_default || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.label.trim()) newErrors.label = "Label is required";
    if (!form.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!form.phone_number.trim() || !/^\d{10}$/.test(form.phone_number)) {
      newErrors.phone_number = "Valid 10-digit phone number required";
    }
    if (!form.address_line.trim()) newErrors.address_line = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.pin_code.trim() || !/^\d{6}$/.test(form.pin_code)) {
      newErrors.pin_code = "Valid 6-digit PIN code required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      label: form.label.trim(),
      full_name: form.full_name.trim(),
      phone_number: form.phone_number.trim(),
      address_line: form.address_line.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      pin_code: form.pin_code.trim(),
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200";

  return (
    <Card className="rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        {initialData?.id ? "Edit Address" : "Add New Address"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Label (Home, Office, etc.)
            </label>
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Home"
              className={inputClass}
            />
            {errors.label && (
              <p className="mt-1 text-xs text-red-600">{errors.label}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="John Doe"
              className={inputClass}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <Input
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="9876543210"
              className={inputClass}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              PIN Code
            </label>
            <Input
              value={form.pin_code}
              onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
              placeholder="560001"
              className={inputClass}
            />
            {errors.pin_code && (
              <p className="mt-1 text-xs text-red-600">{errors.pin_code}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address Line
            </label>
            <Input
              value={form.address_line}
              onChange={(e) => setForm({ ...form, address_line: e.target.value })}
              placeholder="123 Main Street, Apt 4B"
              className={inputClass}
            />
            {errors.address_line && (
              <p className="mt-1 text-xs text-red-600">{errors.address_line}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Area / Locality
            </label>
            <Input
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="Downtown"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City
            </label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Bengaluru"
              className={inputClass}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="default"
            checked={form.is_default}
            onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
          />
          <label htmlFor="default" className="text-sm text-slate-700">
            Set as default address
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Address"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
