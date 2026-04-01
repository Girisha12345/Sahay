import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { currency } from "../../utils/format";

const schema = z.object({
  scheduled_date: z.string().min(1, "Date is required"),
  scheduled_time: z.string().min(1, "Time is required"),
  address: z.string().min(8, "Address is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function BookingForm({
  basePrice,
  onSubmit,
}: {
  basePrice: number;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const platformFee = Number((basePrice * 0.1).toFixed(2));
  const total = basePrice + platformFee;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Input type="date" {...register("scheduled_date")} />
          {errors.scheduled_date && <p className="mt-1 text-xs text-red-600">{errors.scheduled_date.message}</p>}
        </div>
        <div>
          <Input type="time" {...register("scheduled_time")} />
          {errors.scheduled_time && <p className="mt-1 text-xs text-red-600">{errors.scheduled_time.message}</p>}
        </div>
      </div>
      <div>
        <Input placeholder="Service address" {...register("address")} />
        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
      </div>
      <textarea
        placeholder="Notes for provider"
        className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        {...register("notes")}
      />
      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        <p>Service Price: {currency(basePrice)}</p>
        <p>Platform Fee: {currency(platformFee)}</p>
        <p className="mt-1 font-semibold">Total: {currency(total)}</p>
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        Confirm Booking
      </Button>
    </form>
  );
}
