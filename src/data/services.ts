export interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
}

// Central Array of Available Services
// When an admin adds a new service here or via database, it will automatically populate both the Services page and the Book Event modal dropdown!
export const defaultServicesList: ServiceItem[] = [
  {
    title: "Signature Weddings",
    description: "From intimate ceremonies to grand receptions, we design majestic dining experiences that reflect your unique love story.",
    price: "Starting at ₹50,000",
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Birthday Celebrations",
    description: "Bespoke menus and interactive food stations to celebrate life's milestones with unmatched elegance and joy.",
    price: "Starting at ₹15,000",
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de88b635fd4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Baptisms & Christenings",
    description: "Gather your loved ones for a beautiful celebration. We provide elegant, family-friendly catering to commemorate these special milestones.",
    price: "Starting at ₹20,000",
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Corporate Galas",
    description: "Sophisticated menus tailored for high-stakes meetings, product launches, and annual company banquets.",
    price: "Custom Pricing",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Private Dining & Intimate Gatherings",
    description: "Elevate your personal gatherings. Whether it is a cozy holiday party for 10 people or an exclusive anniversary dinner, we bring fine dining to you.",
    price: "Starting at ₹10,000",
    imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Cultural Feasts",
    description: "Authentic, heritage-rich menus that honor traditional Kerala techniques, served with the utmost respect for customary flavors and presentation.",
    price: "Starting at ₹30,000",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];
