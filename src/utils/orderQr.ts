import QRCode from 'qrcode';
import { Order } from '../types';

/**
 * Generates a privacy-preserving, production-safe QR code Data URL.
 * Contains only the secure verification URL and order reference.
 * Excludes customer PII (phone, street address, payment credentials).
 */
export async function generateOrderQrDataUrl(order: Order): Promise<string> {
  try {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : (import.meta.env.APP_URL || '');

    const identifier = order.order_number || order.id;
    const verifyUrl = `${origin}/order/verify/${encodeURIComponent(identifier)}`;

    // Privacy-preserving standardized payload
    const payload = verifyUrl;

    return await QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate order QR code:', err);
    return '';
  }
}

export async function generateSellerOrderQrDataUrl(sellerOrder: { seller_order_number: string; id: string }): Promise<string> {
  try {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : (import.meta.env.APP_URL || '');

    const identifier = sellerOrder.seller_order_number || sellerOrder.id;
    const verifyUrl = `${origin}/order/verify/${encodeURIComponent(identifier)}`;

    return await QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate seller order QR code:', err);
    return '';
  }
}


/**
 * SVG string fallback for QR code printing
 */
export async function generateOrderQrSvg(order: Order): Promise<string> {
  try {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : (import.meta.env.APP_URL || '');

    const identifier = order.order_number || order.id;
    const verifyUrl = `${origin}/order/verify/${encodeURIComponent(identifier)}`;

    return await QRCode.toString(verifyUrl, {
      type: 'svg',
      width: 200,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate order QR SVG:', err);
    return '';
  }
}
