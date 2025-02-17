import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { ServiceRequest } from "@/types/service";

interface ServiceDetailsModalProps {
  request: ServiceRequest;
  open: boolean;
  onClose: () => void;
}

export function ServiceDetailsModal({
  request,
  open,
  onClose,
}: ServiceDetailsModalProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; label: string }> = {
      pending: {
        class: "bg-yellow-500/10 text-yellow-500",
        label: "Pending",
      },
      accepted: {
        class: "bg-blue-500/10 text-blue-500",
        label: "Accepted",
      },
      completed: {
        class: "bg-green-500/10 text-green-500",
        label: "Completed",
      },
      paid: {
        class: "bg-purple-500/10 text-purple-500",
        label: "Paid (Pending)",
      },
    };

    return (
      <Badge className={`${statusConfig[status]?.class || ""}`}>
        {statusConfig[status]?.label || status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Service Request Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Customer & Service Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium">{request.customerName}</p>
                    <p className="text-black/60 dark:text-white/60">
                      {request.customerAddress}
                    </p>
                    <p className="text-black/60 dark:text-white/60">
                      {request.customerCity}, {request.customerPincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Requested on: {formatDate(request.createdAt)}</span>
                </div>
                {request.deliveryDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Service scheduled for:{" "}
                      {formatDate(new Date(request.deliveryDate))}
                      {request.deliveryTime && ` at ${request.deliveryTime}`}
                    </span>
                  </div>
                )}
                <div className="mt-2">{getStatusBadge(request.status)}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Service Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Services Booked</h3>
              <div className="space-y-4">
                {request.items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span className="font-medium">
                        ₹{item.price} × {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Amount</span>
                    <span>
                      ₹
                      {request.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
