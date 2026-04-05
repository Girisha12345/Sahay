import { Card } from "../ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Calendar } from "lucide-react";

interface EarningsSummaryProps {
  totalEarnings: string;
  availableBalance: string;
  withdrawnAmount?: string;
  pendingAmount?: string;
  thisMonthEarnings?: string;
  completedJobs?: number;
  averagePerJob?: string;
}

export function EarningsSummary({
  totalEarnings,
  availableBalance,
  withdrawnAmount = "0",
  pendingAmount = "0",
  thisMonthEarnings = "0",
  completedJobs = 0,
  averagePerJob = "0",
}: EarningsSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Main Earnings Card */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-100">Available to Withdraw</p>
            <p className="text-4xl font-bold mt-2">₹{availableBalance}</p>
            <p className="text-xs text-emerald-100 mt-2">Total Earnings: ₹{totalEarnings}</p>
          </div>
          <Wallet className="h-16 w-16 text-emerald-200 opacity-50" />
        </div>
        <button className="mt-4 w-full rounded-lg bg-white px-4 py-2 font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors">
          Withdraw Now
        </button>
      </Card>

      {/* Bottom Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* This Month */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600">This Month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{thisMonthEarnings}</p>
              <p className="text-xs text-slate-500 mt-1">{completedJobs} jobs completed</p>
            </div>
            <Calendar className="h-5 w-5 text-sky-500" />
          </div>
        </Card>

        {/* Withdrawn */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600">Withdrawn</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{withdrawnAmount}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Successfully paid
              </p>
            </div>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>

        {/* Pending */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{pendingAmount}</p>
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Processing...
              </p>
            </div>
            <TrendingDown className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Average Per Job */}
      {completedJobs > 0 && (
        <Card className="bg-slate-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Average Earnings Per Job</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{averagePerJob}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">{completedJobs} Jobs</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">Avg: ₹{averagePerJob}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
