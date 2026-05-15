import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { BackButton } from "../components/BackButton";
import { StepIndicator } from "../components/checkout/StepIndicator";
import { AddressForm } from "../components/checkout/AddressForm";
import { AddressSelector } from "../components/checkout/AddressSelector";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { PaymentMethodSelector } from "../components/checkout/PaymentMethodSelector";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import checkoutService from "../services/checkoutService";
import { bookingService } from "../services/bookingService";
import { serviceService } from "../services/serviceService";
import { useAuthStore } from "../store/authStore";
import { currency } from "../utils/format";
import type { AddressItem, ServiceItem, Booking } from "../types";

const STEPS = [
  { id: 1, label: "Address" },
  { id: 2, label: "Review" },
  { id: 3, label: "Payment" },
];

type CheckoutLocationState = {
  service: ServiceItem;
  booking?: Booking;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  // Get service/booking from navigation state
  const { service: stateService, booking: initialBooking } = (location.state ||
    {}) as CheckoutLocationState;
  const [service, setService] = useState<ServiceItem | null>(stateService || null);

  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Data State
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<Booking["payment_method"]>("razorpay");
  const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
  const [serviceDate, setServiceDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  });
  const [serviceTime, setServiceTime] = useState("10:00");

  useEffect(() => {
    const serviceIdParam = searchParams.get("serviceId");
    const parsedServiceId = Number(serviceIdParam || 0);

    if (stateService || !Number.isFinite(parsedServiceId) || parsedServiceId <= 0) {
      return;
    }

    const loadService = async () => {
      try {
        const { data } = await serviceService.serviceById(parsedServiceId);
        setService(data);
      } catch {
        setError("Unable to load service details. Please try again.");
      }
    };

    void loadService();
  }, [searchParams, stateService]);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const data = await checkoutService.fetchAddresses();
        setAddresses(data);

        // Auto-select default address
        const defaultAddress = data.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (data.length > 0) {
          setSelectedAddress(data[0]);
        }
      } catch (err) {
        setError("Failed to load addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Validate before moving forward
  const validateStep = () => {
    if (currentStep === 1 && !selectedAddress) {
      setError("Please select or add a delivery address");
      return false;
    }
    if (currentStep === 2 && (!serviceDate || !serviceTime)) {
      setError("Please choose service date and time before payment");
      return false;
    }
    return true;
  };

  const createBookingForCheckout = async () => {
    if (!service || !selectedAddress) {
      throw new Error("Service or address is missing");
    }

    const fullAddress = [selectedAddress.address_line, selectedAddress.area, selectedAddress.city]
      .filter(Boolean)
      .join(", ");
    const platformFee = Number((Number(service.base_price) * 0.1).toFixed(2));
    const totalPrice = Number(service.base_price) + platformFee;

    const response = await bookingService.create({
      service_id: service.id,
      service_date: serviceDate,
      service_time: serviceTime,
      full_name: selectedAddress.full_name || user?.first_name || "Customer",
      phone: selectedAddress.phone_number || user?.phone_number || "",
      address_line: selectedAddress.address_line,
      area: selectedAddress.area || "",
      city: selectedAddress.city || "",
      address: fullAddress || selectedAddress.address_line,
      locality: selectedAddress.area || selectedAddress.city || "General",
      pincode: selectedAddress.pin_code,
      notes: "",
      payment_method: selectedPaymentMethod,
      total_price: Number(totalPrice.toFixed(2)),
    });

    return response.data as Booking;
  };

  const handleAddressSubmit = async (data: Omit<AddressItem, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      const newAddress = await checkoutService.createAddress(data);
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      setError("");
    } catch (err) {
      setError("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!validateStep()) return;

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");
      let bookingToPay = booking;

      if (!bookingToPay) {
        bookingToPay = await createBookingForCheckout();
        setBooking(bookingToPay);
      }

      navigate(`/payment/${bookingToPay.id}`, {
        state: {
          bookingId: bookingToPay.id,
          paymentMethod: selectedPaymentMethod,
          amount: bookingToPay.total_price,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to proceed to payment.";
      setError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no service
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="p-6 text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No Service Selected
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Please select a service before checking out.
          </p>
          <Button onClick={() => navigate("/services")} variant="primary">
            Browse Services
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <BackButton 
            label="← Back to Service"
            fallback="/services"
          />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl border border-slate-200 p-6 shadow-sm">
              {/* Steps */}
              <StepIndicator steps={STEPS} currentStep={currentStep} />

              {/* Step Content */}
              <div className="mt-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {showAddressForm ? (
                      <AddressForm
                        onSubmit={handleAddressSubmit}
                        onCancel={() => setShowAddressForm(false)}
                        loading={loading}
                      />
                    ) : (
                      <AddressSelector
                        selectedAddress={selectedAddress}
                        addresses={addresses}
                        onSelect={setSelectedAddress}
                        onAddNew={() => setShowAddressForm(true)}
                        loading={loading}
                      />
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Review Your Order
                      </h3>
                      <div className="space-y-4">
                        {/* Service Details */}
                        <Card className="rounded-lg border border-slate-200 p-4">
                          <div className="flex gap-4">
                            {service.image && (
                              <img
                                src={service.image}
                                alt={service.title}
                                className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">
                                {service.title}
                              </h4>
                              {service.category && (
                                <p className="text-sm text-slate-600">
                                  {service.category.name}
                                </p>
                              )}
                              <p className="mt-1 text-sm text-slate-700">
                                {service.description}
                              </p>
                              <p className="mt-2 font-semibold text-sky-600">
                                {currency(service.base_price)}
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* Address Details */}
                        {selectedAddress && (
                          <Card className="rounded-lg border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-slate-900 mb-2">
                              Delivery Address
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {selectedAddress.full_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {selectedAddress.address_line}
                              {selectedAddress.area && `, ${selectedAddress.area}`}
                            </p>
                            <p className="text-sm text-slate-600">
                              {selectedAddress.city} - {selectedAddress.pin_code}
                            </p>
                          </Card>
                        )}

                        <Card className="rounded-lg border border-slate-200 p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-3">
                            Schedule Service
                          </p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-slate-600">Service Date</label>
                              <input
                                type="date"
                                value={serviceDate}
                                onChange={(e) => setServiceDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-slate-600">Service Time</label>
                              <input
                                type="time"
                                value={serviceTime}
                                onChange={(e) => setServiceTime(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                              />
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <PaymentMethodSelector
                      selectedMethod={selectedPaymentMethod}
                      onSelect={setSelectedPaymentMethod}
                    />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 border-t border-slate-200 pt-6 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                  disabled={currentStep === 1 || loading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="ml-auto gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Loading...
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      void handlePayment();
                    }}
                    disabled={loading}
                    className="ml-auto gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <OrderSummary
              service={service}
              booking={booking}
              label="Price Details"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
