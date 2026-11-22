import { useEffect, useState } from 'react';
import { ImagePlus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button'; import { Input } from '@/components/ui/Input'; import { Textarea } from '@/components/ui/Textarea'; import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
const blank = { title: '', description: '', category: '', price: '', compareAtPrice: '', stock: '', sku: '', tags: '', imageUrls: '', status: 'active' };
export default function ProductFormDialog({ open, onOpenChange, categories, product, onSaved }) {
  const [form, setForm] = useState(blank); const [busy, setBusy] = useState(false); const [files, setFiles] = useState([]);
  useEffect(() => { if (open) setForm(product ? { ...blank, ...product, category: product.category?._id || product.category || '', imageUrls: (product.images || []).map(image => image.url).join(', '), tags: (product.tags || []).join(', ') } : blank); }, [open, product]);
  const change = e => setForm(v => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async e => { e.preventDefault(); setBusy(true); try {
    let images = form.imageUrls.split(',').map(url => url.trim()).filter(Boolean).map(url => ({ url, alt: form.title }));
    if (files.length) { const fd = new FormData(); files.forEach(file => fd.append('images', file)); const { data } = await api.post('/uploads/product-images', fd); images = [...images, ...data.data.images.map(image => ({ ...image, alt: form.title }))]; }
    if (!images.length && product) images = product.images || [];
    if (!images.length) throw new Error('Add at least one image URL or upload a product image');
    if (images.length > 5) throw new Error('A product can have at most five photos');
    const body = { title: form.title, description: form.description, category: form.category, images, price: Number(form.price), stock: Number(form.stock), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, sku: form.sku || undefined, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), status: form.status };
    if (product) await api.patch(`/products/${product._id}`, body); else await api.post('/products', body);
    toast.success(product ? 'Product updated' : 'Product added to your store'); onSaved?.(); onOpenChange(false);
  } catch (err) { toast.error(err.response?.data?.message || err.message || 'Could not save product'); } finally { setBusy(false); } };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{product ? 'Edit product' : 'Add a new product'}</DialogTitle><DialogDescription>Share another thoughtful find from Evaan Earth.</DialogDescription></DialogHeader><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <div className="sm:col-span-2"><Label>Product name</Label><Input name="title" value={form.title} onChange={change} className="mt-1.5" required /></div>
    <div className="sm:col-span-2"><Label>Description</Label><Textarea name="description" value={form.description} onChange={change} className="mt-1.5" required /></div>
    <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
    <div><Label>Price (₹)</Label><Input name="price" type="number" min="1" value={form.price} onChange={change} className="mt-1.5" required /></div>
    <div><Label>Compare-at price (₹)</Label><Input name="compareAtPrice" type="number" min="0" value={form.compareAtPrice} onChange={change} className="mt-1.5" /></div>
    <div><Label>Available stock</Label><Input name="stock" type="number" min="0" value={form.stock} onChange={change} className="mt-1.5" required /></div>
    <div><Label>SKU (optional)</Label><Input name="sku" value={form.sku} onChange={change} className="mt-1.5" /></div>
    <div><Label>Tags (comma separated)</Label><Input name="tags" value={form.tags} onChange={change} placeholder="handmade, natural, gift" className="mt-1.5" /></div>
    <div className="sm:col-span-2"><Label>Photo URLs (comma separated, up to 5)</Label><Input name="imageUrls" value={form.imageUrls} onChange={change} placeholder="https://… , https://…" className="mt-1.5" /><label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-olive-300 bg-olive-50 p-3 text-sm text-olive-700"><ImagePlus size={18}/><span>{files.length ? `${files.length} image(s) selected` : 'Choose photos (JPG, PNG or WebP · up to 5 images, 6MB each)'}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => setFiles(Array.from(e.target.files || []).slice(0,5))} /></label></div>
    <div className="sm:col-span-2 flex justify-end gap-2 pt-2"><Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={busy}>{busy ? 'Saving…' : <><Plus size={16}/>{product ? 'Save changes' : 'Add product'}</>}</Button></div>
  </form></DialogContent></Dialog>;
}
