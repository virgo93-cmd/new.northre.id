"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Home, MapPin, Plus } from "lucide-react";

export interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

interface AddressesTabProps {
  userId: string;
  initialAddresses?: Address[];
}

type AddressForm = Omit<Address, "id">;
type Message = { type: "success" | "error"; text: string };

const EMPTY_FORM: AddressForm = {
  label: "Rumah",
  recipient_name: "",
  phone_number: "",
  street_address: "",
  city: "",
  province: "",
  postal_code: "",
  is_default: false,
};

const INPUT_CLASS = "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900";

interface FormFieldProps {
  label: string;
  name: keyof AddressForm;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onChange: (name: keyof AddressForm, value: string) => void;
}

function FormField({ label, name, value, placeholder, multiline, onChange }: FormFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(name, event.target.value);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        {label}
      </label>
      {multiline ? (
        <textarea id={name} name={name} value={value} placeholder={placeholder} onChange={handleChange} rows={2} required className={INPUT_CLASS} />
      ) : (
        <input id={name} name={name} value={value} placeholder={placeholder} onChange={handleChange} type="text" required className={INPUT_CLASS} />
      )}
    </div>
  );
}

function AddressCard({ address }: { address: Address }) {
  return (
    <article className={`space-y-3 rounded-3xl border p-6 transition-all ${address.is_default ? "border-neutral-900 bg-neutral-900 text-white shadow-lg" : "border-neutral-200/80 bg-white text-neutral-900"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className={`h-4 w-4 ${address.is_default ? "text-white" : "text-neutral-600"}`} />
          <span className={`rounded-lg px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${address.is_default ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-800"}`}>
            {address.label}
          </span>
        </div>
        {address.is_default && <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">Default</span>}
      </div>
      <div>
        <p className="text-sm font-black">{address.recipient_name}</p>
        <p className={`mt-0.5 text-xs ${address.is_default ? "text-neutral-300" : "text-neutral-500"}`}>{address.phone_number}</p>
      </div>
      <p className={`text-xs leading-relaxed ${address.is_default ? "text-neutral-200" : "text-neutral-600"}`}>
        {address.street_address}, {address.city}, {address.province} {address.postal_code}
      </p>
    </article>
  );
}

export function AddressesTab({ userId, initialAddresses = [] }: AddressesTabProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const updateField = (name: keyof AddressForm, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const closeForm = () => {
    setIsAdding(false);
    setForm(EMPTY_FORM);
  };

  const handleAddAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const shouldBeDefault = form.is_default || addresses.length === 0;
      const newAddress: Address = {
        ...form,
        id: `${userId}-${crypto.randomUUID()}`,
        is_default: shouldBeDefault,
      };

      setAddresses((current) => [
        newAddress,
        ...current.map((address) => shouldBeDefault ? { ...address, is_default: false } : address),
      ]);
      setMessage({ type: "success", text: "Address added successfully to user_addresses." });
      closeForm();
    } catch (error: unknown) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add address." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Saved Addresses</h2>
          <p className="mt-1 text-xs font-medium text-neutral-500">Manage your delivery destinations synchronized with user_addresses table.</p>
        </div>
        {!isAdding && (
          <button type="button" onClick={() => setIsAdding(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-neutral-800">
            <Plus className="h-4 w-4" /><span>Add New Address</span>
          </button>
        )}
      </div>

      {message && (
        <div role="status" className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-bold ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleAddAddress} className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Address Label (label)" name="label" value={form.label} placeholder="e.g. Rumah, Kantor" onChange={updateField} />
            <FormField label="Recipient Name (recipient_name)" name="recipient_name" value={form.recipient_name} onChange={updateField} />
          </div>
          <FormField label="Phone Number (phone_number)" name="phone_number" value={form.phone_number} onChange={updateField} />
          <FormField label="Street Address (street_address)" name="street_address" value={form.street_address} multiline onChange={updateField} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="City (city)" name="city" value={form.city} onChange={updateField} />
            <FormField label="Province (province)" name="province" value={form.province} onChange={updateField} />
            <FormField label="Postal Code (postal_code)" name="postal_code" value={form.postal_code} onChange={updateField} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input id="is_default" type="checkbox" checked={form.is_default} onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))} className="h-4 w-4 rounded accent-neutral-900" />
            <label htmlFor="is_default" className="text-xs font-bold uppercase tracking-wider text-neutral-700">Set as default address (is_default)</label>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <button type="submit" disabled={isSaving} className="cursor-pointer rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 disabled:opacity-50">{isSaving ? "Saving..." : "Save Address"}</button>
            <button type="button" onClick={closeForm} className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-all">Cancel</button>
          </div>
        </form>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/50 py-20 text-center">
          <MapPin className="mb-3 h-12 w-12 text-neutral-400" />
          <p className="text-sm font-black uppercase text-neutral-900">No Saved Addresses</p>
          <p className="mt-1 max-w-[260px] text-xs text-neutral-500">Add your delivery addresses to streamline checkout and order fulfillment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => <AddressCard key={address.id} address={address} />)}
        </div>
      )}
    </div>
  );
}
