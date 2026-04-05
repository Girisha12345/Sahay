export function ReviewForm(props: {
  serviceId: number;
  onSubmitReview: (payload: { service: number; rating: number; comment?: string }) => Promise<void>;
  submitting?: boolean;
}): JSX.Element;
