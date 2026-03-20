import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogIn, LogOut, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ServiceType, Status } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllBookings,
  useIsCallerAdmin,
  useUpdateBookingStatus,
} from "../hooks/useQueries";

const STATUS_LABELS: Record<Status, string> = {
  [Status.pending]: "Pending",
  [Status.confirmed]: "Confirmed",
  [Status.completed]: "Completed",
  [Status.cancelled]: "Cancelled",
};

const STATUS_COLORS: Record<Status, string> = {
  [Status.pending]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [Status.confirmed]: "bg-blue-100 text-blue-800 border-blue-200",
  [Status.completed]: "bg-green-100 text-green-800 border-green-200",
  [Status.cancelled]: "bg-red-100 text-red-800 border-red-200",
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  [ServiceType.gelNails]: "Gel Extensions",
  [ServiceType.acrylicNails]: "Acrylic Extensions",
  [ServiceType.manicure]: "Classic Manicure",
  [ServiceType.pedicure]: "Pedicure",
};

const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

function formatDate(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Admin() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const {
    data: bookings,
    isLoading: bookingsLoading,
    refetch,
  } = useGetAllBookings();
  const updateStatus = useUpdateBookingStatus();

  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  const handleStatusChange = async (id: bigint, status: Status) => {
    setUpdatingId(id);
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status updated successfully.");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <header className="bg-white border-b border-[oklch(0.87_0.06_300)] sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="font-serif text-2xl font-bold text-[oklch(0.22_0.06_300)] hover:text-[oklch(0.62_0.18_300)] transition-colors"
              data-ocid="admin.link"
            >
              Nailed
            </a>
            <span className="font-sans text-xs text-[oklch(0.62_0.18_300)] uppercase tracking-widest border border-[oklch(0.62_0.18_300)] rounded px-2 py-0.5">
              Admin
            </span>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs text-[oklch(0.52_0.08_300)] hidden sm:block">
                {identity?.getPrincipal().toString().slice(0, 12)}...
              </span>
              <Button
                type="button"
                onClick={clear}
                variant="outline"
                size="sm"
                className="font-sans gap-2 border-[oklch(0.87_0.06_300)]"
                data-ocid="admin.secondary_button"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={login}
              disabled={loginStatus === "logging-in" || isInitializing}
              className="bg-[oklch(0.62_0.18_300)] text-white hover:bg-[oklch(0.55_0.2_300)] font-sans gap-2"
              data-ocid="admin.primary_button"
            >
              <LogIn className="w-4 h-4" />
              {loginStatus === "logging-in" ? "Signing in..." : "Login"}
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {!isLoggedIn && !isInitializing && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-6 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="admin.panel"
          >
            <ShieldAlert className="w-16 h-16 text-[oklch(0.62_0.18_300)]" />
            <h1 className="font-serif text-3xl text-[oklch(0.22_0.06_300)]">
              Admin Access Required
            </h1>
            <p className="font-sans text-[oklch(0.52_0.08_300)] max-w-sm">
              Please log in with your identity to access the admin dashboard.
            </p>
            <Button
              type="button"
              onClick={login}
              className="bg-[oklch(0.62_0.18_300)] text-white hover:bg-[oklch(0.55_0.2_300)] font-sans gap-2 px-8"
              data-ocid="admin.primary_button"
            >
              <LogIn className="w-4 h-4" />
              Login to Continue
            </Button>
          </motion.div>
        )}

        {isInitializing && (
          <div
            className="flex justify-center py-24"
            data-ocid="admin.loading_state"
          >
            <div className="space-y-3 w-full max-w-md">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )}

        {isLoggedIn && !adminLoading && isAdmin === false && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="admin.error_state"
          >
            <ShieldAlert className="w-16 h-16 text-destructive" />
            <h2 className="font-serif text-2xl text-[oklch(0.22_0.06_300)]">
              Access Denied
            </h2>
            <p className="font-sans text-[oklch(0.52_0.08_300)]">
              Your account does not have admin privileges.
            </p>
          </motion.div>
        )}

        {isLoggedIn && (adminLoading || isAdmin) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl text-[oklch(0.22_0.06_300)]">
                  Bookings
                </h1>
                <p className="font-sans text-sm text-[oklch(0.52_0.08_300)] mt-1">
                  {bookings?.length ?? 0} total booking
                  {bookings?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="font-sans border-[oklch(0.87_0.06_300)]"
                data-ocid="admin.secondary_button"
              >
                Refresh
              </Button>
            </div>

            {bookingsLoading || adminLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {SKELETON_IDS.map((id) => (
                  <Skeleton key={id} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : !bookings?.length ? (
              <div
                className="bg-white rounded-2xl border border-[oklch(0.87_0.06_300)] p-16 text-center shadow-card"
                data-ocid="admin.empty_state"
              >
                <p className="font-serif text-xl text-[oklch(0.52_0.08_300)]">
                  No bookings yet.
                </p>
                <p className="font-sans text-sm text-[oklch(0.52_0.08_300)] mt-2">
                  Bookings will appear here once customers reserve their
                  sessions.
                </p>
              </div>
            ) : (
              <div
                className="bg-white rounded-2xl border border-[oklch(0.87_0.06_300)] shadow-card overflow-hidden"
                data-ocid="admin.table"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[oklch(0.95_0.03_300)] border-b border-[oklch(0.87_0.06_300)]">
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)]">
                          #
                        </TableHead>
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)]">
                          Name
                        </TableHead>
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)]">
                          Service
                        </TableHead>
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)]">
                          Date
                        </TableHead>
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)]">
                          Phone
                        </TableHead>
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)] max-w-[200px]">
                          Address
                        </TableHead>
                        <TableHead className="font-sans font-semibold text-[oklch(0.22_0.06_300)]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking, i) => (
                        <TableRow
                          key={String(booking.id)}
                          className="border-b border-[oklch(0.95_0.03_300)] hover:bg-[oklch(0.97_0.02_300)] transition-colors"
                          data-ocid={`admin.row.${i + 1}`}
                        >
                          <TableCell className="font-sans text-xs text-[oklch(0.52_0.08_300)] w-8">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-sans font-medium text-[oklch(0.22_0.06_300)]">
                            {booking.name}
                          </TableCell>
                          <TableCell className="font-sans text-sm text-[oklch(0.52_0.08_300)]">
                            {SERVICE_LABELS[booking.serviceType] ??
                              booking.serviceType}
                          </TableCell>
                          <TableCell className="font-sans text-sm text-[oklch(0.52_0.08_300)] whitespace-nowrap">
                            {formatDate(booking.date)}
                          </TableCell>
                          <TableCell className="font-sans text-sm text-[oklch(0.52_0.08_300)]">
                            {booking.phone}
                          </TableCell>
                          <TableCell className="font-sans text-sm text-[oklch(0.52_0.08_300)] max-w-[180px] truncate">
                            {booking.address}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`font-sans text-xs ${STATUS_COLORS[booking.status]}`}
                              >
                                {STATUS_LABELS[booking.status]}
                              </Badge>
                              <Select
                                value={booking.status}
                                onValueChange={(val) =>
                                  handleStatusChange(booking.id, val as Status)
                                }
                                disabled={updatingId === booking.id}
                              >
                                <SelectTrigger
                                  className="w-28 h-7 text-xs font-sans border-[oklch(0.87_0.06_300)]"
                                  data-ocid={`admin.select.${i + 1}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_LABELS).map(
                                    ([val, label]) => (
                                      <SelectItem
                                        key={val}
                                        value={val}
                                        className="font-sans text-xs"
                                      >
                                        {label}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="border-t border-[oklch(0.87_0.06_300)] py-6 text-center bg-[oklch(0.96_0.03_300)]">
        <p className="font-sans text-xs text-[oklch(0.52_0.08_300)]">
          © {currentYear} Nailed Admin Panel
        </p>
      </footer>
    </div>
  );
}
