import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, Heart, UserRound, Leaf, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
export default function Header() {
  const { user, logout } = useAuth(); const { count } = useCart(); const [query, setQuery] = useState(''); const [open, setOpen] = useState(false); const navigate = useNavigate();
  const submit = (e) => { e.preventDefault(); navigate(`/shop?q=${encodeURIComponent(query)}`); setOpen(false); };
  const linkClass = ({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-olive-800' : 'text-olive-600 hover:text-olive-900'}`;
  return <header className="sticky top-0 z-40 border-b border-olive-200/70 bg-background/90 backdrop-blur-xl">
    <div className="container-shell flex h-[82px] items-center justify-between gap-4 2xl:h-24 2xl:gap-8">
      <Link to="/" className="flex shrink-0 items-center gap-3"><img src="/brand/evaan-logo.jpg" alt="Evaan Earth" className="h-14 w-14 rounded-full object-cover 2xl:h-16 2xl:w-16" /><div className="hidden sm:block"><div className="font-display text-[22px] font-semibold leading-none tracking-[.16em] text-olive-900">EVAAN</div><div className="mt-1 text-[9px] font-semibold tracking-[.44em] text-olive-600">EARTH</div></div></Link>
      <nav className="hidden items-center gap-8 md:flex"><NavLink to="/" className={linkClass}>Home</NavLink><NavLink to="/shop" className={linkClass}>Shop</NavLink><a href="/#story" className="text-sm font-medium text-olive-600 hover:text-olive-900">Our story</a>{user?.role === 'seller' && <NavLink to="/seller" className={linkClass}>Seller studio</NavLink>}</nav>
      <form onSubmit={submit} className="hidden max-w-[340px] flex-1 lg:flex xl:max-w-[380px] 2xl:max-w-[460px]"><div className="relative w-full"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-400" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search handmade finds" className="h-10 rounded-full pl-9" /></div></form>
      <div className="flex items-center gap-1.5"><Link to="/wishlist" className="relative hidden rounded-xl p-2.5 text-olive-700 hover:bg-olive-100 sm:block"><Heart size={19} /></Link><Link to="/cart" className="relative rounded-xl p-2.5 text-olive-700 hover:bg-olive-100"><ShoppingBag size={19} />{count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive-700 px-1 text-[10px] text-white">{count}</span>}</Link>
        {user ? <div className="group relative hidden sm:block"><Button variant="outline" size="sm" onClick={() => navigate(user.role === 'seller' ? '/seller' : '/account')}><UserRound size={16} />{user.name.split(' ')[0]}</Button><div className="invisible absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100"><Link className="menu-link" to={user.role === 'seller' ? '/seller' : '/account'}><LayoutDashboard size={15} />{user.role === 'seller' ? 'Seller dashboard' : 'My account'}</Link><button className="menu-link w-full" onClick={async () => { await logout(); navigate('/'); }}><LogOut size={15} />Sign out</button></div></div> : <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>}
        <button className="rounded-xl p-2 text-olive-700 md:hidden" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation"><Menu size={22} /></button>
      </div>
    </div>
    {open && <div className="border-t border-border bg-background px-5 py-4 md:hidden"><form onSubmit={submit} className="mb-4 flex gap-2"><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products" /><Button size="icon"><Search size={17} /></Button></form><div className="grid gap-3"><Link onClick={() => setOpen(false)} to="/">Home</Link><Link onClick={() => setOpen(false)} to="/shop">Shop</Link><Link onClick={() => setOpen(false)} to="/wishlist">Wishlist</Link>{user ? <Link to={user.role === 'seller' ? '/seller' : '/account'}>{user.role === 'seller' ? 'Seller studio' : 'My account'}</Link> : <Link to="/auth">Sign in / Register</Link>}</div></div>}
  </header>;
}
