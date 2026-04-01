import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BookingForm } from "../../components/forms/booking-form";
import { Card } from "../../components/ui/card";
import { bookingService } from "../../services/bookingService";
import { useServiceStore } from "../../store/serviceStore";

export function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services } = useServiceStore();

  const service = useMemo(() => services.find((item) => item.id === Number(id)), [services, id]);

  if (!service) {
    return <Card>Service not found.</Card>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h1 className="text-2xl font-bold">Book {service.title}</h1>
        <p className="mt-1 text-sm text-slate-500">Schedule your service and confirm booking details.</p>
        <div className="mt-5">
          <BookingForm
            basePrice={Number(service.base_price)}
            onSubmit={async (values) => {
              await bookingService.create({
                service: service.id,
                scheduled_date: values.scheduled_date,
                scheduled_time: values.scheduled_time,
                total_price: Number(service.base_price),
              });
              navigate("/customer/bookings");
            }}
          />
        </div>
      </Card>
    </div>
  );
}
