import { useState } from "react";

import { Button } from "./ui/button";

export function ReviewForm({ serviceId, onSubmitReview, submitting }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmitReview({ service: serviceId, rating, comment: comment.trim() });
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Write a Review</h3>

      <div className="mt-3 flex items-center gap-1 text-2xl text-yellow-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="rounded p-0.5 transition hover:bg-yellow-50"
            aria-label={`Set rating ${star}`}
          >
            {star <= rating ? "★" : "☆"}
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-slate-600">{rating}.0 / 5</span>
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share your experience"
        className="mt-3 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <Button type="submit" className="mt-3" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
