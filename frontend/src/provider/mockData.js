export const providerStatsFallback = {
  totalBookings: 82,
  pendingRequests: 6,
  completedJobs: 64,
  totalEarnings: "₹1,84,520",
  averageRating: "4.8",
};

export const bookingsFallback = [
  {
    id: 501,
    customer_name: "Rohit Kumar",
    service_name: "Ceiling Fan Installation",
    date: "Apr 08, 2026",
    time: "10:30 AM",
    address: "JP Nagar, Bengaluru",
    price: "₹918",
    status: "PENDING",
  },
  {
    id: 502,
    customer_name: "Asha N",
    service_name: "Emergency Plumbing Repair",
    date: "Apr 08, 2026",
    time: "01:00 PM",
    address: "Indiranagar, Bengaluru",
    price: "₹1,045",
    status: "ACCEPTED",
  },
  {
    id: 503,
    customer_name: "Prakash S",
    service_name: "Switchboard Repair",
    date: "Apr 07, 2026",
    time: "04:00 PM",
    address: "HSR Layout, Bengaluru",
    price: "₹1,679",
    status: "COMPLETED",
  },
];

export const servicesFallback = [
  {
    id: 1,
    title: "Ceiling Fan Installation",
    category: "Home Services",
    price: "₹918",
    duration: "45 mins",
    location: "Bengaluru",
    rating: "4.7",
    enabled: true,
  },
  {
    id: 2,
    title: "Switchboard Repair Service",
    category: "Home Services",
    price: "₹1,679",
    duration: "60 mins",
    location: "Bengaluru",
    rating: "4.8",
    enabled: true,
  },
  {
    id: 3,
    title: "Kitchen Sink Unclogging",
    category: "Home Services",
    price: "₹2,260",
    duration: "90 mins",
    location: "Bengaluru",
    rating: "4.6",
    enabled: false,
  },
];

export const reviewsFallback = [
  { id: 1, customer: "Riya", rating: 5, comment: "Very punctual and clean work.", service: "Fan Installation" },
  { id: 2, customer: "Anil", rating: 4, comment: "Solved the issue quickly.", service: "Switchboard Repair" },
  { id: 3, customer: "Nisha", rating: 5, comment: "Polite and professional.", service: "Plumbing Repair" },
];

export const chatFallback = [
  { id: 1, text: "Hi, can you come 15 minutes early?", time: "10:12", me: false },
  { id: 2, text: "Sure, I will try my best.", time: "10:14", me: true },
];

export const earningsTableFallback = [
  { id: 1, service: "Fan Installation", customer: "Rohit", amount: "₹918", date: "Apr 05", status: "Paid" },
  { id: 2, service: "Switchboard Repair", customer: "Anil", amount: "₹1,679", date: "Apr 04", status: "Pending" },
  { id: 3, service: "Plumbing", customer: "Riya", amount: "₹1,045", date: "Apr 02", status: "Paid" },
];

export const availabilityFallback = [
  { day: "Monday", from: "09:00", to: "18:00", enabled: true },
  { day: "Tuesday", from: "09:00", to: "18:00", enabled: true },
  { day: "Wednesday", from: "", to: "", enabled: false },
  { day: "Thursday", from: "09:00", to: "18:00", enabled: true },
  { day: "Friday", from: "09:00", to: "18:00", enabled: true },
  { day: "Saturday", from: "10:00", to: "14:00", enabled: true },
  { day: "Sunday", from: "", to: "", enabled: false },
];
