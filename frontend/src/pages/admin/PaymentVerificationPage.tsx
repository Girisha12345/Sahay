import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { paymentService } from "../../services/paymentService";
import { Search, Eye, Check, X, Calendar, User, ExternalLink } from "lucide-react";
import { currency } from "../../utils/format";

type PaymentProof = {
  id: number;
  booking: number;
  customer: number;
  customer_email: string;
  booking_service_title: string;
  booking_customer_name: string;
  amount_expected: string;
  amount_paid: string;
  utr_number: string;
  screenshot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDERPAID" | "OVERPAID";
  created_at: string;
};

export function PaymentVerificationPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Modal State for Image View
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadProofs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await paymentService.listProofs();
      setProofs(data as PaymentProof[]);
    } catch (err) {
      setError((err as Error).message || "Failed to load payment proofs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProofs();
  }, []);

  const handleVerify = async (proofId: number, status: "APPROVED" | "REJECTED") => {
    setVerifyingId(proofId);
    setError(null);
    try {
      await paymentService.verifyProof(proofId, status);
      // Reload proofs
      const { data } = await paymentService.listProofs();
      setProofs(data as PaymentProof[]);
    } catch (err) {
      setError((err as Error).message || `Failed to verify payment as ${status}.`);
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredProofs = proofs.filter((proof) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      String(proof.booking).includes(searchLower) ||
      proof.utr_number.toLowerCase().includes(searchLower) ||
      proof.booking_service_title.toLowerCase().includes(searchLower) ||
      proof.booking_customer_name.toLowerCase().includes(searchLower) ||
      proof.customer_email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-500 font-semibold">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment Verification Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">Review manual UPI payment screenshots and confirm bookings.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {/* Filter / Search Bar */}
      <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Booking ID, Transaction ID, customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent placeholder-slate-400 text-slate-800"
        />
      </Card>

      {/* Proof List Table */}
      <Card className="overflow-hidden border-slate-200 shadow-lg rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Booking Info</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Booking Amount</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Difference</th>
                <th className="px-6 py-4">UPI UTR ID</th>
                <th className="px-6 py-4">Screenshot</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProofs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                    No payment proofs matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProofs.map((proof) => (
                  <tr key={proof.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">#{proof.booking}</p>
                      <p className="text-xs text-slate-500 font-medium">{proof.booking_service_title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-800">{proof.booking_customer_name}</p>
                          <p className="text-xs text-slate-500">{proof.customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {currency(Number(proof.amount_expected))}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {currency(Number(proof.amount_paid))}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const diff = Number(proof.amount_paid) - Number(proof.amount_expected);
                        return (
                          <span
                            className={`font-bold ${
                              diff < 0 ? "text-rose-600" : diff > 0 ? "text-indigo-600" : "text-slate-500"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}{currency(diff)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700 bg-slate-100/60 px-2 py-1 rounded w-fit">
                      {proof.utr_number}
                    </td>
                    <td className="px-6 py-4">
                      {proof.screenshot ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedImage(proof.screenshot)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Image
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(proof.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          proof.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : proof.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : proof.status === "UNDERPAID"
                            ? "bg-orange-50 text-orange-700 border border-orange-200 animate-pulse"
                            : proof.status === "OVERPAID"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {proof.status === "PENDING" ? "Pending Verification" : proof.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {["PENDING", "UNDERPAID", "OVERPAID"].includes(proof.status) ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={verifyingId !== null}
                            onClick={() => handleVerify(proof.id, "APPROVED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-3 gap-1 shadow-sm"
                          >
                            {verifyingId === proof.id ? (
                              <Spinner />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={verifyingId !== null}
                            onClick={() => handleVerify(proof.id, "REJECTED")}
                            className="rounded-lg h-9 px-3 gap-1 shadow-sm"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lightbox / Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 transition-opacity">
          <div className="relative max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 rounded-full bg-slate-100 hover:bg-slate-200 p-2 text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[75vh] max-w-full overflow-auto mt-6 flex justify-center">
              <img
                src={selectedImage}
                alt="Payment Receipt UTR Screenshot"
                className="max-h-[70vh] object-contain rounded-lg border shadow-inner"
              />
            </div>
            <div className="mt-4 flex gap-4 w-full justify-between items-center border-t pt-3">
              <span className="text-xs text-slate-400">Payment Screenshot Verification Link</span>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Open in new tab
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
