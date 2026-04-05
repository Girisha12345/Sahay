import { useEffect, useMemo, useState } from "react";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { addressService } from "../../services/addressService";
import type { AddressItem } from "../../types";

type AddressForm = {
  label: string;
  full_name: string;
  phone_number: string;
  address_line: string;
  area: string;
  city: string;
  pin_code: string;
  is_default: boolean;
};

const initialForm: AddressForm = {
  label: "Home Address",
  full_name: "",
  phone_number: "",
  address_line: "",
  area: "",
  city: "",
  pin_code: "",
  is_default: false,
};

export function CustomerAddresses() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressForm>(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data } = await addressService.list();
      setAddresses(data);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Unable to load saved addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAddresses();
  }, []);

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((left, right) => Number(right.is_default) - Number(left.is_default));
  }, [addresses]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const onSubmit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await addressService.update(editingId, form);
        setMessage("Address updated successfully.");
      } else {
        await addressService.create(form);
        setMessage("Address added successfully.");
      }
      resetForm();
      await fetchAddresses();
    } catch (submitError) {
      setError((submitError as Error).message || "Unable to save address.");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: AddressItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      full_name: item.full_name,
      phone_number: item.phone_number,
      address_line: item.address_line,
      area: item.area || "",
      city: item.city,
      pin_code: item.pin_code,
      is_default: item.is_default,
    });
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this address?")) return;
    await addressService.remove(id);
    await fetchAddresses();
  };

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Saved Addresses</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your frequently used booking addresses.</p>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input placeholder="Label" value={form.label} onChange={(event) => setForm((state) => ({ ...state, label: event.target.value }))} />
          <Input placeholder="Full name" value={form.full_name} onChange={(event) => setForm((state) => ({ ...state, full_name: event.target.value }))} />
          <Input placeholder="Phone number" value={form.phone_number} onChange={(event) => setForm((state) => ({ ...state, phone_number: event.target.value }))} />
          <Input placeholder="Address line" value={form.address_line} onChange={(event) => setForm((state) => ({ ...state, address_line: event.target.value }))} />
          <Input placeholder="Area" value={form.area} onChange={(event) => setForm((state) => ({ ...state, area: event.target.value }))} />
          <Input placeholder="City" value={form.city} onChange={(event) => setForm((state) => ({ ...state, city: event.target.value }))} />
          <Input placeholder="PIN code" value={form.pin_code} onChange={(event) => setForm((state) => ({ ...state, pin_code: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_default} onChange={(event) => setForm((state) => ({ ...state, is_default: event.target.checked }))} />
            Set as default
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => void onSubmit()} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update address" : "Add new address"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>
        {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : sortedAddresses.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedAddresses.map((item) => (
            <Card key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{item.label}</h3>
                    {item.is_default && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">Default</span>}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.address_line}</p>
                  <p className="text-sm text-slate-600">{item.area ? `${item.area}, ` : ""}{item.city}</p>
                  <p className="text-sm font-medium text-slate-900">{item.pin_code}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.full_name} · {item.phone_number}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => onEdit(item)}>Edit</Button>
                <Button variant="danger" onClick={() => void onDelete(item.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">No saved addresses yet. Add one above to speed up future bookings.</p>
        </Card>
      )}
    </div>
  );
}