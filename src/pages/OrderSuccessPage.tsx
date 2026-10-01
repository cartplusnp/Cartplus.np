import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Printer,
  MapPin,
  FileText,
  Copy,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Building,
  Download,
  QrCode,
  Scan,
} from 'lucide-react';
import { generateOrderQrDataUrl } from '../utils/orderQr';

export const OrderSuccessPage: React.FC = () => {
  const { queryParams } = useRouter();
  const { getOrderById } = useOrders();
  const { success } = useToast();
  const orderId = queryParams.get('orderId') || '';

  const order = orderId ? getOrderById(orderId) : undefined;
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (order) {
      generateOrderQrDataUrl(order).then((url) => {
        if (url) setQrDataUrl(url);
      });
    }
  }, [order]);

  const getSlipHtml = (ord: typeof order) => {
    if (!ord) return '';
    const itemsRows = ord.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${it.product_name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${it.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. ${it.price.toLocaleString('en-NP')}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">Rs. ${(it.price * it.quantity).toLocaleString('en-NP')}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>CARTPLUS Order Slip - ${ord.id}</title>
          <style>
            @page { size: auto; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
            .logo { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; margin: 0; }
            .tagline { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
            .company-info { font-size: 11px; color: #475569; margin-top: 6px; }
            .badge { display: inline-block; background: #0f172a; color: #f59e0b; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; }
            .order-id { font-family: monospace; font-size: 16px; font-weight: 900; margin-top: 8px; color: #0f172a; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 20px; }
            .grid h4 { margin: 0 0 6px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
            .grid p { margin: 0; font-size: 12px; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .totals { width: 280px; margin-left: auto; margin-bottom: 20px; font-size: 13px; }
            .totals tr td { padding: 4px 0; }
            .totals .grand-total { border-top: 2px solid #0f172a; font-size: 16px; font-weight: 900; color: #0f172a; padding-top: 8px; }
            .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="logo">CARTPLUS</h1>
              <div class="tagline">More Choices. More Value.</div>
              <div class="company-info">
                Kathmandu Metropolitan City, Nepal<br/>
                Customer Support: cartplus.np@gmail.com
              </div>
            </div>
            <div style="text-align: right;">
              <div class="badge">Official Order Slip & Invoice</div>
              <div class="order-id">${ord.id}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Date: ${new Date(ord.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div class="grid">
            <div>
              <h4>Recipient Information</h4>
              <p><strong>${ord.customer_name}</strong></p>
              <p>${ord.delivery_address.street}, ${ord.delivery_address.ward}</p>
              <p>${ord.delivery_address.municipality}, ${ord.delivery_address.district}, ${ord.delivery_address.province}</p>
              <p style="font-family: monospace; margin-top: 4px;">Phone: ${ord.phone}</p>
            </div>
            <div>
              <h4>Fulfillment & Payment</h4>
              <p>Payment: <strong>${ord.payment_method || 'Cash on Delivery'}</strong></p>
              <p>Status: <strong style="color: ${ord.payment_status === 'paid' ? '#047857' : '#b45309'}; text-transform: uppercase;">${ord.payment_status === 'paid' ? 'PAID' : 'COD DUE AT DELIVERY'}</strong></p>
              <p style="margin-top: 4px;">Courier: <strong>${ord.courier_info?.provider_name || 'Nepal Express Logistics'}</strong></p>
              ${ord.notes ? `<p style="font-style: italic; margin-top: 4px;">Notes: "${ord.notes}"</p>` : ''}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 14px; background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 12px 14px; border-radius: 8px; margin-bottom: 20px;">
            ${qrDataUrl ? `<img src="${qrDataUrl}" width="88" height="88" style="display: block; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; padding: 3px;" alt="Warehouse Scan QR" />` : ''}
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                Warehouse Scan & Express Courier Delivery QR
              </div>
              <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.4;">
                Warehouse dispatchers and courier riders can scan this QR code with any 2D scanner or smartphone camera for instant manifest validation, package sorting, customer contact, and delivery handoff.
              </div>
              <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 4px;">
                ORDER: ${ord.id} • ITEMS: ${ord.items.length} • COD PAYABLE: Rs. ${ord.total.toLocaleString('en-NP')}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount (NPR)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td style="color: #64748b;">Subtotal:</td>
              <td style="text-align: right; font-weight: 600;">Rs. ${ord.subtotal.toLocaleString('en-NP')}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Delivery Fee:</td>
              <td style="text-align: right; font-weight: 600;">${ord.delivery_fee === 0 ? 'FREE' : `Rs. ${ord.delivery_fee.toLocaleString('en-NP')}`}</td>
            </tr>
            <tr class="grand-total">
              <td>Total Amount:</td>
              <td style="text-align: right;">Rs. ${ord.total.toLocaleString('en-NP')}</td>
            </tr>
          </table>

          <div class="footer">
            <p>Thank you for choosing CARTPLUS Nepal. For courier tracking and customer care, visit CARTPLUS Support Desk or email cartplus.np@gmail.com.</p>
            <p style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Generated by CARTPLUS Central Fulfillment Logistics Engine.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    if (!order) return;
    const html = getSlipHtml(order);

    // Method 1: Dedicated isolated iframe printing
    try {
      let iframe = document.getElementById('cartplus-print-frame') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'cartplus-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.border = 'none';
        iframe.style.opacity = '0.01';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (iframeErr) {
            console.warn('Iframe print restricted, opening popup fallback:', iframeErr);
            // Method 2: Popup window fallback
            const win = window.open('', '_blank');
            if (win) {
              win.document.write(html);
              win.document.close();
              win.focus();
              win.print();
            } else {
              // Method 3: In-page slip modal fallback
              setShowSlipModal(true);
              setTimeout(() => {
                try {
                  window.print();
                } catch {
                  // ignore
                }
              }, 300);
            }
          }
        }, 400);
        return;
      }
    } catch (err) {
      console.warn('Direct print iframe error, showing modal:', err);
    }

    // Modal fallback
    setShowSlipModal(true);
    setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore
      }
    }, 300);
  };

  const handleDownloadSlip = () => {
    if (!order) return;
    const html = getSlipHtml(order);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CARTPLUS-Order-Slip-${order.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Official order slip downloaded! You can open and print it anytime.');
  };

  const handleCopySlip = () => {
    if (!order) return;
    const itemsList = order.items
      .map((it) => `• ${it.product_name} (Qty: ${it.quantity}) - Rs. ${(it.price * it.quantity).toLocaleString('en-NP')}`)
      .join('\n');

    const textSlip = `
========================================
           CARTPLUS ORDER SLIP
========================================
Order ID: ${order.id}
Date: ${new Date(order.created_at).toLocaleString()}
Payment Method: ${order.payment_method || 'Cash on Delivery'}
Status: ${order.order_status.toUpperCase()}

CUSTOMER DETAILS:
Name: ${order.customer_name}
Phone: ${order.phone}
Email: ${order.email}
Address: ${order.delivery_address.street}, ${order.delivery_address.ward}, ${order.delivery_address.municipality}, ${order.delivery_address.district}, ${order.delivery_address.province}

ORDER ITEMS:
${itemsList}

----------------------------------------
Subtotal: Rs. ${order.subtotal.toLocaleString('en-NP')}
Delivery Fee: ${order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee.toLocaleString('en-NP')}`}
TOTAL AMOUNT: Rs. ${order.total.toLocaleString('en-NP')}
----------------------------------------
CARTPLUS Pvt. Ltd. | Kathmandu, Nepal
Customer Support: cartplus.np@gmail.com
========================================
    `.trim();

    navigator.clipboard.writeText(textSlip).then(() => {
      setCopied(true);
      success('Order slip details copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Printable CSS Rules for Clean Paper / PDF Output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cartplus-printable-slip, #cartplus-printable-slip * {
            visibility: visible !important;
          }
          #cartplus-printable-slip {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: #0f172a !important;
            display: block !important;
            z-index: 999999 !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
            Order Confirmed!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Thank you for shopping with CARTPLUS. Your order has been registered and is being prepared for dispatch.
          </p>
        </div>

        {/* Order Identifier & Action Bar */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Order Reference Number
            </span>
            <div className="text-xl font-black text-slate-950 font-mono tracking-tight">
              {order?.id || orderId || 'CP-PENDING'}
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span>Payment Method:</span>
              <strong className="text-slate-900 font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px]">
                {order?.payment_method || 'Cash on Delivery'}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {qrDataUrl && (
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="hidden md:flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition-colors shadow-2xs group cursor-pointer text-left"
                title="Warehouse Dispatch QR Code - Click to enlarge"
              >
                <img
                  src={qrDataUrl}
                  alt="Warehouse QR"
                  className="w-9 h-9 object-contain rounded"
                />
                <div className="pr-1">
                  <span className="text-[10px] font-bold text-slate-800 block group-hover:text-amber-600">
                    Warehouse QR
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    2D Scan
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={() => setShowSlipModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>View Slip</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="space-y-6 pt-2">
            {/* Delivery address card */}
            <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1 bg-white">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-slate-800">{order.customer_name}</p>
              <p className="text-slate-600">
                {order.delivery_address.street}, {order.delivery_address.ward}
              </p>
              <p className="text-slate-600">
                {order.delivery_address.municipality}, {order.delivery_address.district}, {order.delivery_address.province}
              </p>
              <p className="text-slate-500 font-mono mt-1">Phone: {order.phone}</p>
            </div>

            {/* Items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 border-b border-slate-200">
                Items in this shipment ({order.items.length})
              </div>
              <div className="divide-y divide-slate-100 p-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={item.product_id || idx} className="py-2.5 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.product_name}</p>
                        <p className="text-slate-400 tabular-nums">
                          Qty: {item.quantity} × Rs. {item.price.toLocaleString('en-NP')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      Rs. {(item.price * item.quantity).toLocaleString('en-NP')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">Rs. {order.subtotal.toLocaleString('en-NP')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="tabular-nums">
                    {order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee.toLocaleString('en-NP')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>
                    Total Due ({order.payment_method === 'Cash on Delivery' ? 'Pay to courier' : 'Paid Online'})
                  </span>
                  <span className="tabular-nums text-base">
                    Rs. {order.total.toLocaleString('en-NP')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/account/orders"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Package className="w-4 h-4" />
            <span>VIEW MY ORDERS</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* MODAL: Printable Official Order Slip & Invoice */}
      {showSlipModal && order && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 font-brand">
                  Official Order Slip & Invoice
                </h3>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Slip Content */}
            <div id="cartplus-printable-slip" className="border border-slate-200 rounded-2xl p-6 bg-white space-y-5 text-xs text-slate-800 font-sans">
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-2xl font-black font-brand text-slate-950 tracking-tight">CARTPLUS</h1>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                    More Choices. More Value.
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Kathmandu Metropolitan City, Nepal<br />
                    PAN / VAT Reg: <strong>609923841</strong>
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 rounded bg-slate-900 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                    Official Tax Invoice
                  </div>
                  <p className="font-mono font-black text-sm text-slate-950 mt-1.5">{order.id}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Date: {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Customer & Delivery Information */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Deliver To:
                  </span>
                  <p className="font-bold text-slate-900">{order.customer_name}</p>
                  <p className="text-slate-600 mt-0.5">
                    {order.delivery_address.street}, {order.delivery_address.ward}<br />
                    {order.delivery_address.municipality}, {order.delivery_address.district}<br />
                    {order.delivery_address.province}
                  </p>
                  <p className="font-mono text-slate-700 mt-1">Phone: {order.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Payment Details:
                  </span>
                  <p className="font-bold text-slate-900">
                    Method: {order.payment_method || 'Cash on Delivery'}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Status: <strong className="text-emerald-700 font-bold uppercase">{order.payment_status === 'paid' ? 'PAID' : 'COD DUE AT DELIVERY'}</strong>
                  </p>
                  {order.notes && (
                    <p className="text-slate-500 mt-1.5 italic">
                      Notes: &quot;{order.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Warehouse Quick Scan QR Section */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-300">
                {qrDataUrl ? (
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                    <img
                      src={qrDataUrl}
                      alt="Order Dispatch QR Code"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <QrCode className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <Scan className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                      Warehouse & Logistics Dispatch QR
                    </span>
                    <span className="text-[9px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      2D Scan Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Scan via warehouse handheld terminal or courier smartphone camera for quick manifest verification, package routing, and customer contact.
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    REF: {order.id} • ITEMS: {order.items.length} • COD: Rs. {order.total.toLocaleString('en-NP')}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.product_name}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{it.quantity}</td>
                      <td className="py-2 px-3 text-right tabular-nums">Rs. {it.price.toLocaleString('en-NP')}</td>
                      <td className="py-2 px-3 text-right font-bold tabular-nums">
                        Rs. {(it.price * it.quantity).toLocaleString('en-NP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="tabular-nums">Rs. {order.subtotal.toLocaleString('en-NP')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span className="tabular-nums">
                      {order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee.toLocaleString('en-NP')}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-950 pt-2 border-t-2 border-slate-900">
                    <span>Grand Total:</span>
                    <span className="tabular-nums text-base">Rs. {order.total.toLocaleString('en-NP')}</span>
                  </div>
                </div>
              </div>

              {/* Slip Footer */}
              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
                <p>Thank you for your business. For tracking or support, visit CARTPLUS Support Desk or email cartplus.np@gmail.com.</p>
                <p className="font-mono text-slate-300">Generated automatically by CARTPLUS Logistics Engine</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySlip}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSlip}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Download Slip</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
