import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection as clientCollection, getDocs as clientGetDocs, deleteDoc as clientDeleteDoc, addDoc as clientAddDoc, serverTimestamp as clientServerTimestamp } from "firebase/firestore";
import { getAuth as getClientAuth, signInWithEmailAndPassword } from "firebase/auth";

// Load environment configuration (.env and .env.local)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const menuPayload = [
  // 1. BEVERAGES (~₹50/glass, suitableMeals: ['Lunch', 'Dinner'])
  {
    title: "Watermelon Juice",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Freshly squeezed chilled watermelon juice with a hint of mint and lime.",
    imageUrl: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pineapple Juice",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Refreshing golden pineapple juice served chilled with tropical sweetness.",
    imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Papaya Juice",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Smooth and wholesome fresh papaya blend served chilled.",
    imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Grape Juice",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Rich sweet black grape nectar served ice cold.",
    imageUrl: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Shamam Juice",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Creamy muskmelon (shamam) shake infused with mild sweetness and milk.",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Mango Juice",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Thick and luscious Alphonso mango punch chilled to perfection.",
    imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Mojitos",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Zesty mint and lime Virgin Mojito sparkling with crushed ice.",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Fresh Lime",
    category: "Beverages",
    suitableMeals: ["Lunch", "Dinner"],
    price: 50,
    unit: "glass",
    description: "Classic refreshing Indian Nimbu Pani served salt, sweet, or blended.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },

  // 2. STARTERS & LIVE COUNTERS (~₹120/plate, suitableMeals: ['Lunch', 'Dinner'])
  {
    title: "Pizza",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Hot gourmet mini pizza squares topped with exotic vegetables and melting cheese.",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Burger",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Bite-sized slider burgers with juiced herb patties and signature creamy relish.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Sandwich",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Triple-decker club sandwich bites layered with garden fresh vegetables and spreads.",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Momos",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Steamed Himalayan dumplings served with spicy tomato and garlic chutney.",
    imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Roll",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Spiced Kerala shredded chicken wrapped in warm griddled flatbread.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Nuggets",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Crispy golden fried chicken bites served with signature dipping sauce.",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Veg Samosa",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Traditional golden pastry triangles stuffed with spiced potatoes and peas.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Fish Fingers",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Crumb-fried succulent fish fillets served with zesty tartar dip.",
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Cheese Balls",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Crispy golden croquettes filled with rich melting cheddar and mozzarella.",
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Veg Roll",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Sautéed spiced garden vegetable wraps in warm soft flatbread.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "French Fries",
    category: "Starter",
    suitableMeals: ["Lunch", "Dinner"],
    price: 120,
    unit: "plate",
    description: "Crispy salted classic golden potato fries served with tangy dip.",
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },

  // 3. MAIN COURSE - 1ST COURSE
  // Breads (~₹20/piece)
  {
    title: "Appam",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 20,
    unit: "piece",
    description: "Lacy bowl-shaped fermented rice pancakes with a soft spongy center.",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Coin Porotta",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 20,
    unit: "piece",
    description: "Bite-sized flaky layered unleavened Kerala griddle breads.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Nool Porotta",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 20,
    unit: "piece",
    description: "Stringy melt-in-mouth artisanal layered string porotta.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Romali Rotti",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 20,
    unit: "piece",
    description: "Paper-thin soft flatbread tossed and baked over a hot inverted griddle.",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ediyappam",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 20,
    unit: "piece",
    description: "Steamed aromatic rice noodle cakes pressed to delicate perfection.",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Porotta",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 20,
    unit: "piece",
    description: "Classic signature flaky layered buttery Kerala flatbread.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  // Stews & Curries (~₹180/portion)
  {
    title: "Duck Mappas",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Tender roasted duck simmered in rich creamy spiced coconut milk gravy.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Kuruma",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Mild and royal white chicken curry cooked with coconut, cashew paste, and whole spices.",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Beef Kuruma",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Succulent beef cubes cooked in an aromatic creamy spiced green Kuruma gravy.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Beef Stew",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Traditional syrian-style fragrant beef stew simmered with potatoes and coconut milk.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Stew",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Delicate and wholesome creamy chicken stew with garden peas, whole pepper, and coconut milk.",
    imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Mutton Stew",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Prime tender mutton cuts slow-cooked in mild spiced creamy Kerala coconut milk broth.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Fish Molly",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Seared whole prime seer fish steaks poached in delicate yellow coconut milk and tomato sauce.",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pork Mustard",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Speciality roasted pork tossed with vibrant crushed yellow mustard seeds and curry leaves.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Korean Pork",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 180,
    unit: "portion",
    description: "Sweet and savory glazed gochujang and soy infused roasted pork ribs and slices.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  // Dry/Fried (~₹220/portion)
  {
    title: "Broasted Chicken",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Pressure-fried crunchy juicy chicken coated with herbs and signature secret crust.",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Al Fahm",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Charcoal grilled Arabian chicken marinated with authentic rustic spices and garlic dip.",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Shawaya",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Rotisserie grilled spiced chicken cooked to succulent golden perfection.",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Kondattam",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Fiery dry pan-roasted Kerala chicken tossed with dried red chilies, shallots, and curry leaves.",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Beef Kondattam",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Spicy pan-fried marinated beef bites tossed in tangy chili tamarind spices.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Dragon Chicken",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Indo-Chinese sweet and spicy fried chicken slivers tossed with bell peppers and cashew nuts.",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Garlic Chicken",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 220,
    unit: "portion",
    description: "Aromatic wok-tossed chicken chunks simmered in savory garlic and green scallion sauce.",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  // Cutlets (~₹40/piece)
  {
    title: "Beef Cutlet",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 40,
    unit: "piece",
    description: "Crispy crumb-fried Kerala beef croquettes seasoned with black pepper and ginger.",
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Cutlet",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 40,
    unit: "piece",
    description: "Golden fried spiced minced chicken patties served with onion rings.",
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Fish Cutlet",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 40,
    unit: "piece",
    description: "Flaky kingfish meat seasoned with herbs and potatoes, crumb-fried to golden crispness.",
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Kanthari Cutlet",
    category: "Main Course",
    subCategory: "1st Course",
    subCourse: "1st Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 40,
    unit: "piece",
    description: "Fiery speciality cutlet spiked with crushed bird's eye chilies (Kanthari) and traditional aromatic spices.",
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },

  // 4. MAIN COURSE - 2ND COURSE
  // Dinner Only (~₹180/plate, suitableMeals: ['Dinner'])
  {
    title: "Fried Rice",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Classic wok-tossed long-grain Basmati fried rice with crunchy vegetables and spring onions.",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ghee Rice",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Fragrant Jeerakasala rice sautéed in pure clarified butter with whole spices, cashews, and raisins.",
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pulav Rice",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Aromatic vegetable pulao cooked with mild green cardamom, cloves, and bay leaves.",
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chicken Roast",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Traditional syrian Christian dry chicken roast caramelized with shallots, spices, and curry leaves.",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pepper Chicken",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Robust black pepper and fennel seed coated pan-roasted succulent chicken bits.",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Beef Roast",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Slow-roasted Kerala beef dry roast with fried coconut slivers (thengothu) and black pepper.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chilly Chicken",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Classic Indo-Chinese wok-tossed fried chicken cubes in sticky green chili and garlic soy sauce.",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Al Fahm Mandhi",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Authentic Arabian smoky Mandhi rice topped with succulent chargrilled Al Fahm chicken and tomato shattah.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Shawaya Mandhi",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Dinner"],
    price: 180,
    unit: "plate",
    description: "Fragrant spiced Yemeni Mandhi rice served with golden tender rotisserie Shawaya chicken.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  // Lunch & Dinner (~₹250/plate, suitableMeals: ['Lunch', 'Dinner'])
  {
    title: "Chicken Dum Biryani",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 250,
    unit: "plate",
    description: "Royal slow-cooked Thalassery Dum Biryani layering marinated chicken and aromatic Jeerakasala rice.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Beef Dum Biryani",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 250,
    unit: "plate",
    description: "Rich spiced beef dum biryani slow-cooked in a sealed vessel with saffron and crispy fried onions.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Mutton Dum Biryani",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Lunch", "Dinner"],
    price: 250,
    unit: "plate",
    description: "Exquisite bone-in mutton dum biryani infused with whole cardamom, mint, and pure ghee.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  // Lunch Only - The Sadhya (~₹300/leaf, suitableMeals: ['Lunch'])
  {
    title: "Plain Rice Traditional Spread",
    category: "Main Course",
    subCategory: "2nd Course",
    subCourse: "2nd Course",
    suitableMeals: ["Lunch"],
    price: 300,
    unit: "leaf",
    description: "Served with Angamaly Manga Curry, Fish Vattichathu, Chicken 65 / Beef Roast Chaps, Aviyal, Thoran, Kondattam, Chamanthi, Salad & Pickle.",
    imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },

  // 5. DESSERTS (~₹100/portion, suitableMeals: ['Lunch', 'Dinner'])
  {
    title: "Ice Cream with Tender Coconut Pudding",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Velvety scoops of premium ice cream served alongside refreshing creamy tender coconut pudding.",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ice Cream with Strawberry Pudding",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Rich strawberry cream pudding accompanied by a cold vanilla scoop and berry drizzle.",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ice Cream with Chocolate Pudding",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Decadent dark chocolate pudding served warm with chilling melting scoop of vanilla bean ice cream.",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Turkish Ice Cream",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Authentic stretchy and chewy Dondurma ice cream served with theatrical flair and pistachio dust.",
    imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pistachio Kunafa",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Middle Eastern spun pastry baked with melted cheese, drizzled with fragrant rose syrup and crushed pistachios.",
    imageUrl: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Luqaimat",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Golden sweet Arabian crunch dumplings drizzled generously with date molasses and toasted sesame seeds.",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Baklava",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Rich buttery phyllo pastry layered with chopped mixed nuts and sweetened with fragrant floral honey syrup.",
    imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Tender Coconut Pudding",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Signature refreshing silken dessert set with sweet coconut water and freshly scraped young coconut flesh.",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Fruit Salad",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Fresh medley of seasonal chopped exotic tropical fruits served chilled with honey dressing.",
    imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Carrot Halwa",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Traditional slow-cooked warm sweet grated carrot pudding prepared in condensed milk and pure ghee with nuts.",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Brownie",
    category: "Dessert",
    suitableMeals: ["Lunch", "Dinner"],
    price: 100,
    unit: "portion",
    description: "Warm decadent fudgy walnut chocolate brownie baked with Belgian dark chocolate.",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

async function runSeeder() {
  console.log(`🚀 Starting database seeding for all ${menuPayload.length} client menu items into Firestore [menu_items] collection...`);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "anna-caterer-2c82a";
  let adminReady = false;
  let dbAdmin = null;

  // Check for Firebase Admin SDK server credentials in environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      if (!getAdminApps().length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT) {
          const keyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
          const serviceAccount = keyRaw.trim().startsWith("{") ? JSON.parse(keyRaw) : path.resolve(process.cwd(), keyRaw);
          initAdminApp({
            credential: cert(serviceAccount),
            projectId,
          });
        } else {
          initAdminApp({ projectId });
        }
      }
      dbAdmin = getAdminFirestore();
      await dbAdmin.collection("menu_items").limit(1).get();
      adminReady = true;
      console.log("✅ Using Firebase Admin SDK with server credentials for seeding...");
    } catch (adminErr) {
      console.log("Notice: Firebase Admin SDK authentication failed. Switching automatically to Firebase Client SDK using .env credentials...");
      adminReady = false;
    }
  } else {
    console.log("Notice: Server service account credentials (GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_KEY) not found in local environment. Switching automatically to Firebase Client SDK using .env credentials...");
    adminReady = false;
  }

  if (adminReady) {
    const colRef = dbAdmin.collection("menu_items");
    const existingSnap = await colRef.get();
    if (!existingSnap.empty) {
      console.log(`🧹 Cleaning up ${existingSnap.size} existing items in [menu_items] collection via Admin SDK...`);
      const batch = dbAdmin.batch();
      existingSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log("✨ Cleanup completed.");
    }

    console.log("📥 Inserting new menu items via Admin SDK...");
    let count = 0;
    for (const item of menuPayload) {
      const payload = {
        ...item,
        createdAt: FieldValue.serverTimestamp(),
      };
      await colRef.add(payload);
      count++;
      console.log(`  [${count}/${menuPayload.length}] Added: ${item.title} (${item.category}) - ₹${item.price}/${item.unit}`);
    }
    console.log(`\n🎉 SUCCESS! Database is fully seeded with all ${menuPayload.length} client menu items!`);
    process.exit(0);
  }

  // Client SDK Fallback with optional Admin Login Support
  console.log("⚙️ Initializing Firebase Client SDK fallback...");
  const clientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const app = initClientApp(clientConfig);
  const dbClient = getClientFirestore(app);
  const auth = getClientAuth(app);

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    console.log(`🔐 Authenticating as executive administrator [${process.env.ADMIN_EMAIL}]...`);
    try {
      await signInWithEmailAndPassword(auth, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
      console.log("✅ Administrator authentication successful!");
    } catch (authErr) {
      console.warn("⚠️ Administrator authentication attempt failed:", authErr.message);
    }
  }

  const colRef = clientCollection(dbClient, "menu_items");

  try {
    const existingSnap = await clientGetDocs(colRef);
    if (!existingSnap.empty) {
      console.log(`🧹 Cleaning up ${existingSnap.size} existing items in [menu_items] collection via Client SDK...`);
      for (const doc of existingSnap.docs) {
        await clientDeleteDoc(doc.ref);
      }
      console.log("✨ Cleanup completed.");
    }

    console.log("📥 Inserting new menu items via Client SDK...");
    let count = 0;
    for (const item of menuPayload) {
      const payload = {
        ...item,
        createdAt: clientServerTimestamp(),
      };
      await clientAddDoc(colRef, payload);
      count++;
      console.log(`  [${count}/${menuPayload.length}] Added: ${item.title} (${item.category}) - ₹${item.price}/${item.unit}`);
    }

    console.log(`\n🎉 SUCCESS! Database is fully seeded with all ${menuPayload.length} client menu items!`);
    process.exit(0);
  } catch (firestoreErr) {
    if (firestoreErr?.message?.includes("PERMISSION_DENIED") || firestoreErr?.code === "permission-denied") {
      console.log("\n" + "=".repeat(80));
      console.log("🛑 FIRESTORE WRITE PERMISSION DENIED NOTICE:");
      console.log("=".repeat(80));
      console.log("Your local .env currently contains public client API keys, and Firestore security rules require an authenticated user to modify the [menu_items] collection.");
      console.log("\n💡 To execute this seeder against your live database, use ONE of the following authentication methods:\n");
      console.log("👉 OPTION 1: Admin Email & Password (Easiest)");
      console.log("   Run the script by supplying your executive admin portal login credentials:");
      console.log("   $env:ADMIN_EMAIL='admin@annacaterers.com'; $env:ADMIN_PASSWORD='yourpassword'; node scripts/seedFullMenu.mjs\n");
      console.log("👉 OPTION 2: Firebase Service Account Key (Admin SDK)");
      console.log("   1. In Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key.");
      console.log("   2. Save the downloaded JSON file as `serviceAccountKey.json` in your project root.");
      console.log("   3. Add to your .env or .env.local: GOOGLE_APPLICATION_CREDENTIALS='serviceAccountKey.json'");
      console.log("   4. Run: node scripts/seedFullMenu.mjs");
      console.log("=".repeat(80) + "\n");
      process.exit(0);
    } else {
      throw firestoreErr;
    }
  }
}

runSeeder().catch((err) => {
  console.error("❌ Fatal error during menu seeding:", err);
  process.exit(1);
});
