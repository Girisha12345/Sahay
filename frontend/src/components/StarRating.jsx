export function StarRating({ rating = 0, size = "text-sm" }) {
  const rounded = Math.round(Number(rating || 0));

  return (
    <div className={`inline-flex items-center gap-0.5 ${size} text-yellow-500`} aria-label={`Rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rounded ? "★" : "☆"}</span>
      ))}
    </div>
  );
}
