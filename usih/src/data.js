export const workers = [
  { id: 1, name: "Aman Verma", role: "Home Cleaning", rating: 4.8, jobs: 312, city: "Gorakhpur", distance: 1.2 },
  { id: 2, name: "Neeraj Kumar", role: "Plumber", rating: 4.7, jobs: 286, city: "Lucknow", distance: 2.4 },
  { id: 3, name: "Pooja Singh", role: "Electrician", rating: 4.9, jobs: 421, city: "Kanpur", distance: 3.1 },
  { id: 4, name: "Rahul Yadav", role: "Carpenter", rating: 4.6, jobs: 198, city: "Varanasi", distance: 4.2 },
  { id: 5, name: "Sakshi Gupta", role: "Gardener", rating: 4.8, jobs: 244, city: "Prayagraj", distance: 2.8 },
  { id: 6, name: "Vivek Mishra", role: "Appliance Repair", rating: 4.5, jobs: 177, city: "Ayodhya", distance: 5.2 },
  { id: 7, name: "Riya Sharma", role: "Painter", rating: 4.7, jobs: 219, city: "Agra", distance: 3.9 },
  { id: 8, name: "Mohit Singh", role: "Laundry", rating: 4.6, jobs: 155, city: "Meerut", distance: 4.6 },
  { id: 9, name: "Arjun Patel", role: "Moving & Delivery", rating: 4.9, jobs: 338, city: "Noida", distance: 2.2 },
  { id: 10, name: "Kavya Verma", role: "Home Cook", rating: 4.8, jobs: 201, city: "Bareilly", distance: 3.5 }
];

export const services = [
  { id: 1, title: "Home Cleaning", category: "Cleaning", price: 299, rating: 4.6, time: "30–45 min", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80" },
  { id: 2, title: "Plumbing", category: "Plumbing", price: 249, rating: 4.5, time: "45–90 min", image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80" },
  { id: 3, title: "Electrical", category: "Electrical", price: 299, rating: 4.7, time: "30–60 min", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80" },
  { id: 4, title: "Carpentry", category: "Carpentry", price: 349, rating: 4.6, time: "60–120 min", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80" },
  { id: 5, title: "Appliance Repair", category: "Appliance Repair", price: 299, rating: 4.5, time: "30–90 min", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80" },
  { id: 6, title: "Gardening", category: "Gardening", price: 199, rating: 4.8, time: "45–90 min", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80" },
  { id: 7, title: "Painting", category: "Painting", price: 399, rating: 4.5, time: "90–180 min", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80" },
  { id: 8, title: "Laundry", category: "Laundry", price: 149, rating: 4.6, time: "30–60 min", image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80" },
  { id: 9, title: "Moving & Delivery", category: "Moving & Delivery", price: 499, rating: 4.7, time: "60–150 min", image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=900&q=80" },
  { id: 10, title: "Home Cooking", category: "Cooking", price: 399, rating: 4.8, time: "60–120 min", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80" }
];

export const categories = ["All Services", ...services.map(s => s.category)];
