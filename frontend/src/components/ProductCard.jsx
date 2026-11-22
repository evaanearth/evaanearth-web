import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { money } from '@/lib/utils';
export default function ProductCard({ product, onAdd, onWishlist, wished = false }) {
  const out = product.stock <= 0; const { user } = useAuth(); const wishlist = useWishlist(); const isWished = wished || Boolean(wishlist?.has(product._id));
  const toggle = async () => { if (onWishlist) return onWishlist(product); if (!user) return toast.info('Sign in to save your wishlist'); try { const added = await wishlist.toggle(product._id); toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist'); } catch (e) { toast.error(e.message || 'Could not update wishlist'); } };
  return <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: .22 }} className="product-card group">
    <div className="relative overflow-hidden rounded-[1.1rem] bg-olive-100"><Link to={`/product/${product.slug}`}><img src={product.images?.[0]?.url || '/brand/product-placeholder.svg'} alt={product.images?.[0]?.alt || product.title} className="aspect-[4/4.25] w-full object-cover transition duration-700 group-hover:scale-[1.045]" /></Link>
      <button onClick={toggle} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 ${isWished ? 'text-rose-600' : 'text-olive-700'}`} aria-label="Add to wishlist"><Heart size={18} fill={isWished ? 'currentColor' : 'none'} /></button>
      {out ? <Badge variant="danger" className="absolute bottom-3 left-3">Sold out</Badge> : product.stock <= 3 && <Badge variant="gold" className="absolute bottom-3 left-3">Only {product.stock} left</Badge>}
    </div>
    <div className="px-1 pb-1 pt-4"><div className="mb-1 flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-olive-500">{product.category?.name || 'Handmade'}</span><span className="flex items-center gap-1 text-xs text-olive-600"><Star size={13} className="fill-gold text-gold"/>{Number(product.rating || 0).toFixed(1)} <span className="text-olive-400">({product.numReviews || 0})</span></span></div>
      <Link to={`/product/${product.slug}`} className="line-clamp-1 font-display text-xl font-semibold text-olive-900 hover:text-olive-600">{product.title}</Link>
      <div className="mt-3 flex items-center justify-between gap-2"><span className="text-base font-bold text-olive-900">{money(product.price)}</span><Button size="sm" variant="outline" disabled={out} onClick={() => onAdd?.(product)}><ShoppingBag size={15}/><span className="hidden sm:inline">Add</span></Button></div>
    </div>
  </motion.article>;
}
