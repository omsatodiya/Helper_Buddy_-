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
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

interface OrderTimelineModalProps {
  order: Order;
  open: boolean;
  onClose: () => void;
}

interface TimelineEvent {
  status: string;
  date: Date;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export function OrderTimelineModal({
  order,
  open,
  onClose,
}: OrderTimelineModalProps) {
  const getTimelineEvents = (order: Order): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        status: "created",
        date: order.createdAt,
        icon: <Calendar className="w-5 h-5" />,
        title: "Order Placed",
        description:
          order.deliveryDate && order.deliveryTime
            ? `Service requested for ${formatDate(
                new Date(order.deliveryDate)
              )} at ${order.deliveryTime}`
            : "Service requested",
        color: "text-blue-500",
      },
    ];

    // Add provider responses
    if (order.providerResponses) {
      Object.entries(order.providerResponses).forEach(
        ([providerId, response]) => {
          if (response.status === "accepted") {
            const date =
              response.updatedAt instanceof Date
                ? response.updatedAt
                : response.updatedAt.toDate();
            events.push({
              status: "accepted",
              date,
              icon: <CheckCircle2 className="w-5 h-5" />,
              title: "Provider Accepted",
              description: `Service accepted by ${
                order.providerName || "Provider"
              }`,
              color: "text-green-500",
            });
          }
        }
      );
    }

    if (order.status === "completed") {
      events.push({
        status: "completed",
        date: order.updatedAt,
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: "Service Completed",
        description: "Service has been completed successfully",
        color: "text-green-500",
      });
    }

    if (order.status === "cancelled") {
      events.push({
        status: "cancelled",
        date: order.updatedAt,
        icon: <XCircle className="w-5 h-5" />,
        title: "Service Cancelled",
        description: "Service request was cancelled",
        color: "text-red-500",
      });
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const timelineEvents = getTimelineEvents(order);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details #{order.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Order Details */}
          <div className="space-y-4">
            <div className="aspect-video relative rounded-lg overflow-hidden border">
              {order.items[0]?.imageUrl ? (
                <Image
                  src={order.items[0].imageUrl}
                  alt={order.items[0].name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Service Details</h3>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Delivery Details</h3>
              <div className="text-sm space-y-1">
                <p>{order.customerName}</p>
                <p>{order.customerAddress}</p>
                <p>
                  {order.customerCity} - {order.customerPincode}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold">Order Timeline</h3>
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative pl-6 pb-6">
                  {index !== timelineEvents.length - 1 && (
                    <div className="absolute left-[11px] top-6 h-full w-[2px] bg-gray-200" />
                  )}
                  <div className={`absolute left-0 top-1 ${event.color}`}>
                    {event.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(event.date)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {order.status === "accepted" && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Service window: {order.thresholdTime} minutes
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
