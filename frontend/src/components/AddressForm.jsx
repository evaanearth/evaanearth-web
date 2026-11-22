import { useState } from 'react';
import { Button } from '@/components/ui/Button'; import { Input } from '@/components/ui/Input'; import { Label } from '@/components/ui/Label';
const initial = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India' };
export default function AddressForm({ onSubmit, onCancel, initialValue = initial, submitLabel = 'Save address' }) {
  const [form, setForm] = useState({ ...initial, ...initialValue }); const [busy, setBusy] = useState(false);
  const change = e => setForm(v => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async e => { e.preventDefault(); setBusy(true); try { await onSubmit(form); } finally { setBusy(false); } };
  const fields = [['fullName','Full name'],['phone','Phone number'],['addressLine1','Address line 1'],['addressLine2','Address line 2 (optional)'],['city','City'],['state','State'],['postalCode','PIN code'],['country','Country']];
  return <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{fields.map(([name,label]) => <div className={['addressLine1','addressLine2'].includes(name) ? 'sm:col-span-2' : ''} key={name}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} value={form[name]} onChange={change} required={!['addressLine2'].includes(name)} className="mt-1.5" /></div>)}<div className="sm:col-span-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button></div></form>;
}
