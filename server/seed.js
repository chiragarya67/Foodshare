/**
 * Seed script — run once to populate demo data
 * Usage: node server/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
const dns = require('dns')

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
])

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodshare';

const DONATIONS = [
  { title:'Fresh Sourdough Loaves', category:'bakery', quantity:25, unit:'items', description:'Baked this morning, perfect condition.', expiryDate:addDays(2), pickupBy:addHours(8) },
  { title:'Mixed Salad Greens', category:'produce', quantity:15, unit:'kg', description:'Surplus from weekly delivery.', expiryDate:addDays(1), pickupBy:addHours(6) },
  { title:'Whole Milk (2L Cartons)', category:'dairy', quantity:30, unit:'items', description:'Sell-by today, still fresh.', expiryDate:addDays(0), pickupBy:addHours(4) },
  { title:'Cooked Chicken Portions', category:'meat', quantity:10, unit:'kg', description:'Fully cooked, refrigerated, safe to eat.', expiryDate:addDays(1), pickupBy:addHours(5), dietary:{halal:true} },
  { title:'Prepared Curry Meals', category:'prepared', quantity:40, unit:'items', description:'Vegetarian curry, foil containers.', expiryDate:addDays(1), pickupBy:addHours(7), dietary:{vegetarian:true,vegan:true} },
  { title:'Canned Tomatoes (bulk)', category:'packaged', quantity:50, unit:'items', description:'Long shelf life, surplus stock.', expiryDate:addDays(365) , pickupBy:addDays(7) },
  { title:'Orange Juice Cartons', category:'beverages', quantity:24, unit:'items', description:'Best before tomorrow.', expiryDate:addDays(1), pickupBy:addHours(10) },
  { title:'Assorted Pastries', category:'bakery', quantity:60, unit:'items', description:'Croissants, muffins, Danish pastries.', expiryDate:addDays(1), pickupBy:addHours(6) },
];

function addDays(n) { const d = new Date(); d.setDate(d.getDate()+n); return d; }
function addHours(n) { const d = new Date(); d.setHours(d.getHours()+n); return d; }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany({}), Donation.deleteMany({})]);
  console.log('Cleared existing data');

  // Create users
  const [business1, business2, charity1, charity2, admin] = await User.create([
    { name:'Green Leaf Bakery', email:'demo-business@foodshare.com', password:'demo123', role:'business', businessType:'Bakery', phone:'+91 98765 43210', address:{ street:'14 MG Road', city:'Mumbai', state:'MH', zip:'400001' }, isVerified:true },
    { name:'Metro Supermarket', email:'metro@foodshare.com', password:'demo123', role:'business', businessType:'Grocery Store', phone:'+91 87654 32109', address:{ street:'22 Brigade Road', city:'Bangalore', state:'KA', zip:'560001' }, isVerified:true },
    { name:'City Food Bank', email:'demo-charity@foodshare.com', password:'demo123', role:'charity', charityType:'Food Bank', phone:'+91 97531 24680', capacity:500, address:{ street:'7 Nehru Nagar', city:'Delhi', state:'DL', zip:'110001' }, isVerified:true },
    { name:'Hope Shelter', email:'hope@foodshare.com', password:'demo123', role:'charity', charityType:'Homeless Shelter', phone:'+91 86420 13579', capacity:200, address:{ street:'45 Anna Salai', city:'Chennai', state:'TN', zip:'600002' }, isVerified:true },
    { name:'Admin User', email:'admin@foodshare.com', password:'admin123', role:'admin', isVerified:true },
  ]);
  console.log('Created 5 users');

  // Create donations
  const pickupAddr = { street:'14 MG Road', city:'Mumbai', state:'MH', zip:'400001' };
  const donations = await Donation.create(
    DONATIONS.slice(0,5).map(d => ({ ...d, business: business1._id, pickupAddress: pickupAddr, dietary: d.dietary||{} })).concat(
    DONATIONS.slice(5).map(d => ({ ...d, business: business2._id, pickupAddress: { street:'22 Brigade Road', city:'Bangalore', state:'KA', zip:'560001' }, dietary: d.dietary||{} })))
  );

  // Match some donations
  donations[0].status = 'completed'; donations[0].matchedCharity = charity1._id; donations[0].matchedAt = new Date(); donations[0].completedAt = new Date(); donations[0].actualWeight = 12;
  donations[1].status = 'matched'; donations[1].matchedCharity = charity1._id; donations[1].matchedAt = new Date();
  donations[2].status = 'matched'; donations[2].matchedCharity = charity2._id; donations[2].matchedAt = new Date();
  await Promise.all(donations.map(d => d.save()));

  console.log(`Created ${donations.length} donations`);
  console.log('\n✅ Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  Business  → demo-business@foodshare.com / demo123');
  console.log('  Charity   → demo-charity@foodshare.com / demo123');
  console.log('  Admin     → admin@foodshare.com / admin123');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
