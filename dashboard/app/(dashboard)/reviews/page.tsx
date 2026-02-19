import ReviewsClient from "./ReviewsClient";
import { getDummyReviews } from "../../../lib/dummy/data";

export default async function ReviewsPage() {
  const reviews = getDummyReviews();

  return (
    <ReviewsClient
      initialReviews={reviews as import("../../../lib/api/reviews.api").Review[]}
    />
  );
}
