import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, MapPin, Check } from "lucide-react";
import type { AddressItem } from "../../types";

type AddressSelectorProps = {
  selectedAddress: AddressItem | null;
  addresses: AddressItem[];
  onSelect: (address: AddressItem) => void;
  onAddNew: () => void;
  loading?: boolean;
};

export function AddressSelector({
  selectedAddress,
  addresses,
  onSelect,
  onAddNew,
  loading = false,
}: AddressSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Delivery Address</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddNew}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="border border-dashed border-slate-300 p-6 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-600">No addresses saved yet</p>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddNew}
            className="mt-3 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => onSelect(address)}
              disabled={loading}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selectedAddress?.id === address.id
                  ? "border-sky-600 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{address.label}</p>
                    {address.is_default && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800">{address.full_name}</p>
                  <p className="text-sm text-slate-600">{address.phone_number}</p>
                  <p className="text-sm text-slate-600">
                    {address.address_line}
                    {address.area && `, ${address.area}`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {address.city}, {address.pin_code}
                  </p>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300">
                  {selectedAddress?.id === address.id && (
                    <Check className="h-4 w-4 text-sky-600" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
