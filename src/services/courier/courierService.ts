/**
 * Courier Service Adapter Interface for CARTPLUS
 * Provides clean integration hooks for third-party logistics (e.g., Nepal Can Move, Nepal Express).
 * If no live API credentials are configured, falls back to manual operations without inventing fake GPS or driver data.
 */

export interface ShipmentDetails {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  district: string;
  address: string;
  codAmount: number;
}

export interface TrackingResult {
  status: string;
  trackingNumber: string;
  courierName: string;
  location: string;
  lastUpdated: string;
  isApiIntegrated: boolean;
}

export interface CourierAdapter {
  createShipment(details: ShipmentDetails): Promise<{ success: boolean; trackingNumber?: string; error?: string }>;
  getTracking(trackingNumber: string): Promise<TrackingResult | null>;
  cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }>;
}

export class ManualCourierService implements CourierAdapter {
  async createShipment(details: ShipmentDetails): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    // Generate internal tracking manifest code for warehouse dispatch
    const trackingNumber = `NEX-MANUAL-${details.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
    return {
      success: true,
      trackingNumber,
    };
  }

  async getTracking(trackingNumber: string): Promise<TrackingResult | null> {
    return {
      status: 'shipped',
      trackingNumber,
      courierName: 'Standard Surface Dispatch (Manual Courier)',
      location: 'In Transit',
      lastUpdated: new Date().toISOString(),
      isApiIntegrated: false,
    };
  }

  async cancelShipment(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

export const defaultCourierService = new ManualCourierService();
