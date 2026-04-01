export const currency = (value: string | number) => {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numeric || 0);
};

export const fullName = (firstName?: string, lastName?: string) =>
  [firstName, lastName].filter(Boolean).join(" ");
