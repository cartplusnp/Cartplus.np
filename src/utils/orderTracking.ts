import { OrderStatus, TrackingEvent, CourierInfo } from '../types';

/**
 * Production Order Tracking Helper
 * Uses authentic database events. Never invents fake courier GPS, fake rider names,
 * or synthetic kilometer distances.
 */

export const STATUS_LABELS: Record<OrderStatus, { title: string; defaultDescription: string }> = {
  pending: {
    title: 'Order Placed',
    defaultDescription: 'Order received and recorded in the CARTPLUS system awaiting fulfillment.',
  },
  confirmed: {
    title: 'Order Confirmed',
    defaultDescription: 'Order confirmed and verified by merchant.',
  },
  processing: {
    title: 'Processing & Packed',
    defaultDescription: 'Items picked, quality inspected, and packaged for courier handover.',
  },
  shipped: {
    title: 'Dispatched to Courier',
    defaultDescription: 'Handed over to logistics carrier for transit.',
  },
  out_for_delivery: {
    title: 'Out for Delivery',
    defaultDescription: 'Package is with delivery personnel on the final route.',
  },
  delivered: {
    title: 'Delivered',
    defaultDescription: 'Package delivered to recipient and payment settled.',
  },
  cancelled: {
    title: 'Cancelled',
    defaultDescription: 'Order was cancelled and inventory returned to catalog.',
  },
  rejected: {
    title: 'Rejected',
    defaultDescription: 'Order could not be fulfilled.',
  },
};

/**
 * Builds chronological timeline stages from actual database events.
 */
export function formatTrackingTimeline(
  events: TrackingEvent[] = [],
  currentStatus: OrderStatus = 'pending'
): TrackingEvent[] {
  if (events && events.length > 0) {
    return [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // Fallback minimal event when no database tracking rows exist yet
  const stageInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.pending;
  return [
    {
      id: 'evt-init',
      status: currentStatus,
      title: stageInfo.title,
      description: stageInfo.defaultDescription,
      location: 'Central Fulfillment',
      timestamp: new Date().toISOString(),
      completed: true,
      current: true,
    },
  ];
}

/**
 * Formats a courier info object cleanly without fake rider telemetry.
 */
export function getSafeCourierInfo(courier?: CourierInfo): CourierInfo | undefined {
  if (!courier || !courier.provider_name) return undefined;
  return {
    provider_name: courier.provider_name,
    tracking_number: courier.tracking_number,
    tracking_url: courier.tracking_url,
    last_updated: courier.last_updated,
  };
}
