import { Card } from "../ui/card";
import { 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Star,
  AlertCircle
} from "lucide-react";

interface ProviderDashboardStatsProps {
  stats: {
    inbox: number;
    active: number;
    completed: number;
    earnings: string;
    rating: number;
  };
}

export function ProviderDashboardStats({ stats }: ProviderDashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {/* Incoming Requests */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
          <AlertCircle className="h-6 w-6 text-sky-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Inbox</p>
          <p className="text-2xl font-bold text-slate-900">{stats.inbox}</p>
          <p className="text-xs text-slate-500">Pending requests</p>
        </div>
      </Card>

      {/* Active Jobs */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Active</p>
          <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
          <p className="text-xs text-slate-500">In progress</p>
        </div>
      </Card>

      {/* Completed Jobs */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
          <p className="text-xs text-slate-500">This month</p>
        </div>
      </Card>

      {/* Earnings */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Earnings</p>
          <p className="text-2xl font-bold text-slate-900">₹{stats.earnings}</p>
          <p className="text-xs text-slate-500">Available to withdraw</p>
        </div>
      </Card>

      {/* Rating */}
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
          <Star className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Rating</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-slate-900">{stats.rating.toFixed(1)}</p>
            <p className="text-xs text-slate-500">⭐</p>
          </div>
          <p className="text-xs text-slate-500">Based on reviews</p>
        </div>
      </Card>
    </div>
  );
}
