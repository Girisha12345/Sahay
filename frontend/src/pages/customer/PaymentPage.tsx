import { Loader2, ShieldCheck, Smartphone, CheckCircle2, AlertTriangle, FileText, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import Tesseract from "tesseract.js";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { bookingService } from "../../services/bookingService";
import { paymentService } from "../../services/paymentService";
import { serviceService } from "../../services/serviceService";
import { useAuthStore } from "../../store/authStore";
import { currency } from "../../utils/format";
import type { Booking, ServiceItem } from "../../types";

type PaymentProofResponse = {
  id: number;
  utr_number: string;
  screenshot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDERPAID" | "OVERPAID";
  amount_expected: string;
  amount_paid: string;
  created_at: string;
};

export function PaymentPage() {
  const navigate = useNavigate();
  const { bookingId: bookingIdParam } = useParams();
  const { user } = useAuthStore();

  const bookingId = Number(bookingIdParam || 0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [utrNumber, setUtrNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [showProofForm, setShowProofForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [ocrStatus, setOcrStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");

  // Existing proof state (if any)
  const [existingProof, setExistingProof] = useState<PaymentProofResponse | null>(null);

  const fetchPaymentDetails = async () => {
    if (!bookingId) {
      setErrorMessage("Invalid booking reference.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Load bookings to find match
      const { data: bookingList } = await bookingService.customerBookings();
      const matchedBooking = (bookingList as Booking[]).find((item) => item.id === bookingId) || null;
      if (!matchedBooking) {
        throw new Error("Booking record not found.");
      }

      setBooking(matchedBooking);

      // Load service details
      const { data: serviceData } = await serviceService.serviceById(matchedBooking.service);
      setService(serviceData as ServiceItem);

      // Load payment proof if pending or rejected
      try {
        const { data: proofData } = await paymentService.getProof(bookingId);
        setExistingProof(proofData as PaymentProofResponse);
        if (matchedBooking.status === "PAYMENT_REJECTED") {
          setShowProofForm(true); // pre-open form for resubmission
        }
      } catch {
        // No proof exists yet
        setExistingProof(null);
      }
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      setAmountPaid(String(booking.total_price));
      const upiLink = `upi://pay?pa=9019738720@ybl&pn=Sahay Marketplace&am=${booking.total_price}&cu=INR`;
      QRCode.toDataURL(upiLink, { width: 256, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [booking]);

  const handleAmountChange = (val: string) => {
    setAmountPaid(val);
    if (booking && Number(val) !== Number(booking.total_price)) {
      setAmountError("Payment amount does not match booking amount.");
    } else {
      setAmountError(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setOcrStatus("idle");

      // 1. Try to find a 12-digit number in the filename (fast, instant check)
      const filenameMatch = file.name.match(/\b\d{12}\b/);
      if (filenameMatch) {
        setUtrNumber(filenameMatch[0]);
        setOcrStatus("success");
        return;
      }

      // 2. Run OCR using Tesseract.js
      setOcrStatus("scanning");
      try {
        const { data: { text } } = await Tesseract.recognize(
          file,
          "eng",
          {
            logger: (m) => console.log("Tesseract log:", m),
          }
        );
        console.log("OCR Extracted Text:", text);
        
        // Clean OCR text: strip spaces and dashes to catch numbers with spaces like "1234 - 5678 - 9012"
        const cleanedText = text.replace(/[\s-]/g, "");
        const match = cleanedText.match(/\b\d{12}\b/);
        
        if (match) {
          setUtrNumber(match[0]);
          setOcrStatus("success");
        } else {
          // If no match on cleaned text, try raw match on original text
          const rawMatch = text.match(/\b\d{12}\b/);
          if (rawMatch) {
            setUtrNumber(rawMatch[0]);
            setOcrStatus("success");
          } else {
            setOcrStatus("failed");
          }
        }
      } catch (err) {
        console.error("OCR Error:", err);
        setOcrStatus("failed");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (Number(amountPaid) !== Number(booking.total_price)) {
      setErrorMessage("Payment amount does not match booking amount.");
      return;
    }

    if (!utrNumber.trim()) {
      setErrorMessage("Please enter the UTR / Transaction ID.");
      return;
    }

    if (!screenshot) {
      setErrorMessage("Please upload the payment confirmation screenshot.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("booking_id", String(booking.id));
      formData.append("amount_expected", String(booking.total_price));
      formData.append("amount_paid", amountPaid.trim());
      formData.append("utr_number", utrNumber.trim());
      formData.append("screenshot", screenshot);

      await paymentService.submitProof(formData);
      setSuccessMessage("Payment proof uploaded successfully! Our admin will verify it shortly.");
      
      // Reload booking & proof details
      await fetchPaymentDetails();
      setShowProofForm(false);
      setUtrNumber("");
    } catch (error: any) {
      const serverMsg = error?.response?.data?.detail || error?.message || "Failed to submit payment proof.";
      setErrorMessage(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-500 font-medium">Fetching payment session...</p>
        </div>
      </div>
    );
  }

  if (!booking || !service) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="p-6 text-center border-slate-200 shadow-lg rounded-2xl">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Details Unavailable</h2>
          <p className="text-sm text-slate-600 mb-6">
            {errorMessage || "The booking details could not be retrieved at this time."}
          </p>
          <Button onClick={() => navigate("/customer/bookings")} className="w-full">
            Back to Bookings
          </Button>
        </Card>
      </div>
    );
  }

  const isPendingVerification = booking.status === "PAYMENT_VERIFICATION_PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isRejected = booking.status === "PAYMENT_REJECTED";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/customer/bookings")}
            className="hover:bg-slate-100 text-slate-600 font-medium"
          >
            ← Back to Bookings
          </Button>
        </div>

        {/* Success / Error Messages */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-emerald-900">Success</h3>
                <p className="text-sm text-emerald-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm animate-shake">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
              <div>
                <h3 className="font-semibold text-rose-900">Error</h3>
                <p className="text-sm text-rose-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* State 1: Confirmed / Approved */}
        {isConfirmed && (
          <Card className="overflow-hidden border border-emerald-100 shadow-xl rounded-3xl bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              Your payment verification succeeded and your booking is confirmed. Your service provider will contact you shortly.
            </p>
            <div className="grid gap-4 max-w-md mx-auto sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/customer/bookings`)}
                className="w-full"
              >
                View Bookings
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/services")}
                className="w-full bg-[#5f259f] hover:bg-[#4d1d82] text-white border-none"
              >
                Browse More Services
              </Button>
            </div>
          </Card>
        )}

        {/* State 2: Verification Pending */}
        {isPendingVerification && (
          <Card className="overflow-hidden border border-sky-100 shadow-xl rounded-3xl bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 mb-6">
              <Spinner />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Verification Pending</h1>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              We have received your payment proof (UTR: <span className="font-semibold text-slate-900">{existingProof?.utr_number}</span>).
              Our admin team is validating the UTR details. Bookings are confirmed shortly.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 max-w-md mx-auto mb-8 border text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Submitted Proof</p>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">Transaction Screenshot</p>
                  <p className="text-xs text-slate-500">Uploaded on {existingProof ? new Date(existingProof.created_at).toLocaleDateString() : ""}</p>
                </div>
                {existingProof?.screenshot && (
                  <a
                    href={existingProof.screenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/customer/bookings")}
              className="mx-auto block"
            >
              Back to Dashboard
            </Button>
          </Card>
        )}

        {/* State 3: QR Payment Submission (Pending Payment / Payment Rejected) */}
        {(booking.status === "PENDING_PAYMENT" || isRejected) && (
          <div className="grid gap-8 md:grid-cols-5">
            {/* Payment Panel */}
            <div className="md:col-span-3 space-y-6">
              {/* PhonePe Header Card */}
              <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white">
                <div className="bg-[#5f259f] text-white p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-white" />
                    <div>
                      <h2 className="text-lg font-bold">UPI QR Payment</h2>
                      <p className="text-xs text-purple-200">Scan & Pay via any UPI App</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/25 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Secure
                  </span>
                </div>

                <div className="p-6 text-center">
                  {isRejected && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-rose-900 text-sm">Previous Verification Rejected</h4>
                        <p className="text-xs text-rose-800 mt-1">
                          The admin rejected your previous submission. Please make sure you paid the exact amount, enter the correct UTR, and upload the valid receipt.
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
                    Scan the QR code below using PhonePe, Google Pay, Paytm, or any UPI application and pay the exact booking amount.
                  </p>

                  {/* QR Display */}
                  <div className="mx-auto w-fit border-2 border-slate-100 rounded-3xl p-4 bg-white shadow-md mb-6">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Sahāy Payments Dynamic QR Code"
                        className="h-64 w-64 object-contain rounded-2xl"
                      />
                    ) : (
                      <div className="h-64 w-64 flex items-center justify-center bg-slate-50 rounded-2xl">
                        <Spinner />
                      </div>
                    )}
                  </div>

                  {/* Prominent Amount Display */}
                  <div className="mb-6 rounded-2xl bg-purple-50 border border-purple-100 p-4 inline-block px-8">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 block mb-1">
                      Amount to Pay
                    </span>
                    <span className="text-3xl font-black text-[#5f259f]">
                      {currency(booking.total_price)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold mb-6 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Scan using PhonePe, GPay, Paytm, BHIM or other UPI Apps
                  </p>

                  <div className="border-t border-slate-100 pt-6">
                    {!showProofForm ? (
                      <div className="space-y-3">
                        <Button
                          onClick={() => setShowProofForm(true)}
                          className="w-full bg-[#5f259f] hover:bg-[#4d1d82] text-white font-bold h-12 rounded-xl transition"
                        >
                          I Have Paid
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/customer/bookings")}
                          className="w-full text-slate-500 hover:bg-slate-50 font-bold"
                        >
                          Cancel Payment
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleFormSubmit} className="text-left space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm border-b pb-2 mb-2">Submit Payment Proof</h3>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                            Amount Paid (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Enter exact amount paid"
                            value={amountPaid}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#5f259f] focus:ring-2 ${
                              amountError ? "border-rose-300 focus:ring-rose-100" : "focus:ring-purple-100"
                            }`}
                          />
                          {amountError && (
                            <p className="mt-1 text-xs font-semibold text-rose-600">
                              {amountError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                            UPI Transaction ID / UTR (12-Digit Number) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Enter 12-digit UTR Number"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#5f259f] focus:ring-2 focus:ring-purple-100"
                          />
                          {ocrStatus === "scanning" && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium animate-pulse">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                              Scanning receipt image for UTR number...
                            </p>
                          )}
                          {ocrStatus === "success" && (
                            <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              ✓ Auto-detected UTR number from receipt!
                            </p>
                          )}
                          {ocrStatus === "failed" && (
                            <p className="mt-1.5 text-xs text-amber-600 font-medium">
                              ⚠ Could not auto-detect UTR. Please enter it manually.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                            Payment Screenshot Receipt *
                          </label>
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition relative">
                            <input
                              type="file"
                              accept="image/*"
                              required={!isRejected} // screenshot is always required
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {screenshotPreview ? (
                              <div className="space-y-2">
                                <img
                                  src={screenshotPreview}
                                  alt="Preview"
                                  className="mx-auto max-h-36 object-contain rounded-lg shadow-sm"
                                />
                                <p className="text-xs font-medium text-purple-600">Click or Drag to replace image</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                                <p className="text-xs font-semibold text-slate-600">Upload Transaction Screenshot</p>
                                <p className="text-[10px] text-slate-400">PNG, JPG or JPEG up to 5MB</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowProofForm(false)}
                            className="w-1/3"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="w-2/3 bg-[#5f259f] hover:bg-[#4d1d82] text-white font-bold"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Verification Proof"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Invoice Detail / Summary Panel */}
            <div className="md:col-span-2 space-y-6">
              {/* Payment Details Card */}
              <Card className="border border-slate-200 shadow-md rounded-2xl p-5 bg-white">
                <h3 className="font-bold text-slate-900 mb-4 text-base">Booking Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Service Name</p>
                    <p className="text-sm font-semibold text-slate-800">{service.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Booking ID</p>
                    <p className="text-sm font-mono font-semibold text-slate-800">#{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Customer Name</p>
                    <p className="text-sm font-semibold text-slate-800">{booking.full_name || user?.first_name || "Valued Customer"}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Amount Payable</p>
                      <p className="text-xs text-slate-400 italic">Platform fees included</p>
                    </div>
                    <span className="text-xl font-black text-[#5f259f]">{currency(booking.total_price)}</span>
                  </div>
                </div>
              </Card>

              {/* Step By Step Guide */}
              <Card className="border border-slate-200 shadow-md rounded-2xl p-5 bg-white">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">How to Pay:</h3>
                <ol className="space-y-3 text-xs text-slate-600 list-decimal pl-4">
                  <li>Scan the QR code displayed using any UPI App (PhonePe, GPay, Paytm, etc.).</li>
                  <li>Verify payee details and pay the exact amount: <span className="font-bold text-slate-900">{currency(booking.total_price)}</span>.</li>
                  <li>Copy the 12-digit transaction UTR / UPI Ref ID.</li>
                  <li>Take a screenshot showing the transaction confirmation.</li>
                  <li>Click "I Have Paid" and submit UTR and receipt to confirm.</li>
                </ol>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
