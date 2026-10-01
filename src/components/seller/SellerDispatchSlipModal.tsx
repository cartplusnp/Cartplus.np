import React, { useState, useEffect } from 'react';
import { SellerOrder, SellerProfile } from '../../types';
import { generateSellerOrderQrDataUrl } from '../../utils/orderQr';
import { Printer, X, ShieldCheck, QrCode, Building2, Package, MapPin, Truck, CheckCircle2 } from 'lucide-react';

interface SellerDispatchSlipModalProps {
  sellerOrder: SellerOrder;
  seller: SellerProfile;
  customerOrderNumber?: string;
  onClose: () => void;
}

export const SellerDispatchSlipModal: React.FC<SellerDispatchSlipModalProps> = ({
  sellerOrder,
  seller,
  customerOrderNumber,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    generateSellerOrderQrDataUrl({
      id: sellerOrder.id,
      seller_order_number: sellerOrder.seller_order_number || sellerOrder.id,
    })
      .then((url) => {
        if (isMounted) {
          setQrCodeUrl(url);
          setIsGeneratingQr(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate seller dispatch slip QR:', err);
        if (isMounted) setIsGeneratingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sellerOrder]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print dispatch slip');
      return;
    }

    const itemsHtml = (sellerOrder.items || [])
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 10px; font-size: 12px; color: #475569;">${idx + 1}</td>
          <td style="padding: 8px 10px; font-size: 12px; font-weight: 600; color: #0f172a;">
            ${item.product_name}
            ${item.product_sku ? `<div style="font-size: 10px; color: #64748b; font-family: monospace;">SKU: ${item.product_sku}</div>` : ''}
          </td>
          <td style="padding: 8px 10px; font-size: 12px; text-align: center; font-weight: 700;">${item.quantity}</td>
          <td style="padding: 8px 10px; font-size: 12px; text-align: right;">Rs. ${item.unit_price.toLocaleString()}</td>
          <td style="padding: 8px 10px; font-size: 12px; text-align: right; font-weight: 700;">Rs. ${item.total_price.toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    const slipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CARTPLUS Merchant Dispatch Slip - ${sellerOrder.seller_order_number}</title>
        <style>
          @page { size: auto; margin: 12mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 16px;
            font-size: 12px;
            color: #0f172a;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
          }
          .badge {
            display: inline-block;
            background: #0f172a;
            color: #f59e0b;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th {
            background: #f1f5f9;
            padding: 8px 10px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #cbd5e1;
            text-align: left;
          }
          .qr-box {
            display: flex;
            align-items: center;
            gap: 16px;
            background: #f8fafc;
            border: 1.5px dashed #cbd5e1;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">CARTPLUS NEPAL</div>
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">Multi-Vendor Merchant Dispatch Manifest</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Standard Express Handover Slip</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">Merchant Dispatch Slip</div>
            <div style="font-family: monospace; font-size: 14px; font-weight: 900; margin-top: 4px;">
              ${sellerOrder.seller_order_number}
            </div>
            <div style="font-size: 10px; color: #64748b;">Parent Order: #${customerOrderNumber || sellerOrder.order_id}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Merchant & Pickup Store</h4>
            <p style="margin: 0; font-weight: 800; font-size: 13px;">${seller.store_name}</p>
            <p style="margin: 2px 0 0 0;">${seller.address}</p>
            <p style="margin: 0;">${seller.city}, ${seller.district}, ${seller.province}</p>
            <p style="margin: 3px 0 0 0; font-family: monospace; font-size: 11px;">PAN/VAT: <strong>${seller.pan_vat_number || 'N/A'}</strong></p>
            <p style="margin: 0; font-family: monospace; font-size: 11px;">Store Contact: ${seller.phone}</p>
          </div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Fulfillment & Handover</h4>
            <p style="margin: 0;">Order Date: <strong>${new Date(sellerOrder.created_at).toLocaleDateString('en-NP', { dateStyle: 'medium' })}</strong></p>
            <p style="margin: 2px 0 0 0;">Status: <strong>${sellerOrder.status.toUpperCase()}</strong></p>
            <p style="margin: 2px 0 0 0;">Courier Partner: <strong>${sellerOrder.courier_code?.toUpperCase() || 'NEPAL CARRIER EXPRESS'}</strong></p>
            <p style="margin: 2px 0 0 0; font-family: monospace;">Tracking #: <strong>${sellerOrder.tracking_number || 'PENDING_SCAN'}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">Settlement: ${sellerOrder.settlement_status.toUpperCase()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Package Items Description</th>
              <th style="width: 50px; text-align: center;">Qty</th>
              <th style="width: 90px; text-align: right;">Unit Price</th>
              <th style="width: 100px; text-align: right;">Total (NPR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="5" style="text-align: center; padding: 12px; color: #94a3b8;">No items listed</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="border-top: 2px solid #0f172a; font-weight: 800;">
              <td colspan="4" style="padding: 10px; text-align: right;">Subtotal:</td>
              <td style="padding: 10px; text-align: right;">Rs. ${sellerOrder.subtotal.toLocaleString()}</td>
            </tr>
            ${
              sellerOrder.delivery_fee
                ? `
            <tr style="font-size: 11px; color: #64748b;">
              <td colspan="4" style="padding: 4px 10px; text-align: right;">Delivery Allocation:</td>
              <td style="padding: 4px 10px; text-align: right;">Rs. ${sellerOrder.delivery_fee.toLocaleString()}</td>
            </tr>
            `
                : ''
            }
            <tr style="font-size: 13px; font-weight: 900; background: #f8fafc;">
              <td colspan="4" style="padding: 8px 10px; text-align: right;">Merchant Settlement Payout:</td>
              <td style="padding: 8px 10px; text-align: right; color: #047857;">Rs. ${sellerOrder.payout_amount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div class="qr-box">
          ${
            qrCodeUrl
              ? `<img src="${qrCodeUrl}" width="96" height="96" style="border-radius: 4px; border: 1px solid #cbd5e1; background: white;" />`
              : `<div style="width: 96px; height: 96px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b;">QR READY</div>`
          }
          <div style="flex: 1;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 4px;">
              Courier Handover 2D Digital Scan Code
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              Scan at merchant pickup checkpoint to verify physical carton integrity and trigger real-time dispatch tracking status.
            </div>
            <div style="font-family: monospace; font-size: 10px; color: #64748b;">
              SLIP_ID: ${sellerOrder.id} • HASH_KEY: ${sellerOrder.seller_order_number}
            </div>
          </div>
        </div>

        <div class="footer">
          <div>Handover Signature / Stamp: ______________________</div>
          <div>Courier Rider Signature: ______________________</div>
          <div>Generated via CARTPLUS Platform</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(slipContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-brand">
                Merchant Dispatch Slip & Handover QR
              </h3>
              <p className="text-xs text-slate-500">
                Official package manifest for express courier pickup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Preview Card */}
        <div className="mt-4 p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
          {/* Top Info */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md">
                Official Merchant Slip
              </span>
              <h4 className="text-lg font-black text-slate-900 font-brand mt-1">
                {sellerOrder.seller_order_number}
              </h4>
              <p className="text-xs text-slate-500">
                Customer Reference: <span className="font-mono font-medium text-slate-700">#{customerOrderNumber || sellerOrder.order_id}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fulfillment Status
              </span>
              <span className="inline-block mt-0.5 text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                {sellerOrder.status}
              </span>
            </div>
          </div>

          {/* Store & Courier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Pickup Origin Store</span>
              </div>
              <p className="font-bold text-slate-900">{seller.store_name}</p>
              <p className="text-slate-600 mt-0.5">{seller.address}, {seller.city}</p>
              <p className="text-slate-500 font-mono text-[11px] mt-1">
                PAN/VAT: {seller.pan_vat_number || 'N/A'} • {seller.phone}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] mb-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Courier Routing & Tracking</span>
              </div>
              <p className="font-bold text-slate-900">
                {sellerOrder.courier_code?.toUpperCase() || 'NEPAL CARRIER EXPRESS'}
              </p>
              <p className="text-slate-600 mt-0.5 font-mono">
                Tracking: {sellerOrder.tracking_number || 'Pending scan'}
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                Settlement: <span className="font-semibold text-emerald-600">{sellerOrder.settlement_status}</span>
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-600 uppercase">
              <span>Items to Package</span>
              <span>{(sellerOrder.items || []).length} Line Items</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {(sellerOrder.items || []).map((item, idx) => (
                <div key={item.id || idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{item.product_name}</p>
                    {item.product_sku && (
                      <p className="text-[10px] font-mono text-slate-400">SKU: {item.product_sku}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">Qty: {item.quantity}</span>
                    <p className="text-[11px] text-slate-500">Rs. {item.total_price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Net Merchant Payout</span>
              <span className="font-black text-sm text-emerald-600 font-brand">
                Rs. {sellerOrder.payout_amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Handover QR Code Section */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center gap-4">
            <div className="shrink-0 w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
              {isGeneratingQr ? (
                <div className="text-[10px] text-slate-400 text-center animate-pulse">Generating QR...</div>
              ) : qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Handover QR" className="w-full h-full object-contain p-1" />
              ) : (
                <QrCode className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Handover Code</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The courier will scan this 2D barcode at pickup to verify carton custody without sharing buyer personal data.
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Ref: {sellerOrder.id}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dispatch Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
