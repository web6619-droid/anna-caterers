import AdminDashboard from "./AdminDashboard";
import Header from "@/components/Header";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let services: any[] = [];
  try {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    services = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        icon: data.icon,
      };
    });
  } catch (error) {
    console.error("Error fetching admin services:", error);
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-[#a0a0a0]">Manage your services, events, and pricing.</p>
        </div>
        
        <AdminDashboard initialServices={services} />
      </div>
    </main>
  );
}
