import { Card } from "../ui/card";
import { 
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react";

interface CustomerStatsProps {
  upcomingCount: number;
  completedCount: number;
  totalSpent: string;
  activeSavedProviders: number;
}

export function CustomerStats({
  upcomingCount,
  completedCount,
  totalSpent,
  activeSavedProviders,
}: CustomerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {/* Upcoming Bookings */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Zap className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Upcoming</p>
          <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
          <p className="text-xs text-slate-500">Scheduled</p>
        </div>
      </Card>

      {/* Completed Services */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="text-xs text-slate-500">Services</p>
        </div>
      </Card>

      {/* Total Spent */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
          <TrendingUp className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Total Spent</p>
          <p className="text-2xl font-bold text-slate-900">₹{totalSpent}</p>
          <p className="text-xs text-slate-500">All time</p>
        </div>
      </Card>

      {/* Saved Providers */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
          <Award className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Favorites</p>
          <p className="text-2xl font-bold text-slate-900">{activeSavedProviders}</p>
          <p className="text-xs text-slate-500">Saved providers</p>
        </div>
      </Card>

      {/* Active Status */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
          <ClipboardList className="h-6 w-6 text-sky-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Member</p>
          <p className="text-2xl font-bold text-slate-900">⭐</p>
          <p className="text-xs text-slate-500">Active customer</p>
        </div>
      </Card>
    </div>
  );
}
