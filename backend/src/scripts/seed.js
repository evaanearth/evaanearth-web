import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

await connectDB();
if (!env.SEED_SELLER_EMAIL || !env.SEED_SELLER_PASSWORD) throw new Error('Set SEED_SELLER_EMAIL and SEED_SELLER_PASSWORD in backend/.env first');
const sellerEmail = env.SEED_SELLER_EMAIL.toLowerCase();
let seller = await User.findOne({ role: 'seller' });
if (!seller) seller = await User.create({ name: 'Evaan Earth Seller', email: sellerEmail, password: await bcrypt.hash(env.SEED_SELLER_PASSWORD, 12), role: 'seller', isVerified: true });
else console.log(`Seller already exists: ${seller.email}`);
const categories = ['Handmade Soaps', 'Warli Art', 'Bamboo & Home', 'Natural Foods', 'Handmade Bags'];
const categoryMap = {};
for (const name of categories) categoryMap[name] = await Category.findOneAndUpdate({ name }, { $setOnInsert: { name, slug: slugify(name), description: `Thoughtfully made ${name.toLowerCase()} from Evaan Earth.` } }, { upsert: true, new: true });
const samples = [
  { title: 'Haldi & Lemon Handmade Soap', category: 'Handmade Soaps', price: 149, stock: 24, images: [{ url: '/products/haldi-lemon-soap.jpg', alt: 'Handmade haldi and lemon rose-shaped soap' }], description: 'A small-batch handmade soap featuring a warm turmeric tone and a fresh lemon-inspired feel. Each bar is individually crafted.', tags: ['handmade', 'soap', 'haldi', 'lemon'] },
  { title: 'Handmade Rose Soap', category: 'Handmade Soaps', price: 149, stock: 18, images: [{ url: '/products/rose-soap.jpg', alt: 'Pink rose-shaped handmade soap' }], description: 'A rose-shaped handmade soap, carefully made in small batches. A thoughtful addition to a natural self-care routine.', tags: ['handmade', 'soap', 'rose'] },
  { title: 'Warli Painting on Wood', category: 'Warli Art', price: 899, stock: 5, images: [{ url: '/products/warli-wood.jpg', alt: 'Traditional Warli painting on a wooden panel' }], description: 'A handmade Warli folk-art panel on wood, featuring rhythmic figures and village motifs. Each artwork carries its own character.', tags: ['warli', 'art', 'wood', 'handmade'] },
  { title: 'Framed Warli Folk Painting', category: 'Warli Art', price: 1299, stock: 3, images: [{ url: '/products/warli-framed.jpg', alt: 'Framed Warli folk painting' }], description: 'A framed Warli folk-art composition for a warm, handcrafted accent in your home. Available in different sizes on request.', tags: ['warli', 'painting', 'framed', 'folk art'] },
  { title: 'Mahua Dry-Fruit Energy Laddu', category: 'Natural Foods', price: 299, stock: 16, images: [{ url: '/products/mahua-laddu.jpg', alt: 'Mahua dry-fruit energy laddus' }], description: 'Homemade Mahua and dry-fruit energy laddus. Freshly made in small batches; ingredients and pack size can be confirmed before ordering.', tags: ['mahua', 'laddu', 'dry fruit', 'homemade'] }
];
for (const item of samples) {
  const category = categoryMap[item.category]; const slug = slugify(item.title);
  await Product.findOneAndUpdate({ slug }, { $setOnInsert: { ...item, slug, category: category._id, status: 'active' } }, { upsert: true, new: true });
}
console.log(`Seed complete. Seller: ${seller.email}`);
await mongoose.disconnect();
