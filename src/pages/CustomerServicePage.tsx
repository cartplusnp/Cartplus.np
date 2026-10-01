import React, { useState } from 'react';
import { useSupport } from '../context/SupportContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import {
  Headphones,
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Truck,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { SupportCategory, SupportRequest, SupportMessage } from '../types';

export const CustomerServicePage: React.FC = () => {
  const { requests, createRequest, addMessage } = useSupport();
  const { user } = useAuth();
  const { queryParams } = useRouter();

  const prefilledOrderId = queryParams.get('orderId') || '';

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orderId, setOrderId] = useState(prefilledOrderId);
  const [category, setCategory] = useState<SupportCategory>('Order Help');
  const [subject, setSubject] = useState(prefilledOrderId ? `Assistance with Order ${prefilledOrderId}` : '');
  const [message, setMessage] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Selected Ticket for conversation view
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // FAQ open/close states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work on CARTPLUS?',
      a: 'Cash on Delivery is available across all 7 provinces of Nepal. When our delivery courier arrives at your address, you can inspect the package condition and hand over the exact cash amount. No prepayment is required.',
    },
    {
      q: 'What is the delivery timeframe within and outside Kathmandu Valley?',
      a: 'Orders inside Kathmandu, Lalitpur, and Bhaktapur are typically delivered within 24 to 48 hours. Shipments to major cities like Pokhara, Biratnagar, Chitwan, and Butwal take 2 to 3 business days, while outer districts take 3 to 5 business days.',
    },
    {
      q: 'How do I return a defective or damaged product?',
      a: 'We offer a 7-day hassle-free replacement policy. Open a customer service ticket here under "Return/Refund Help" or call our helpline with your Order ID and photo of the item.',
    },
    {
      q: 'Can I change my delivery address or phone number after ordering?',
      a: 'Yes! As long as the order status is "Pending" or "Confirmed", you can submit an Order Help ticket with your updated details and our team will adjust the dispatch label.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !subject || !message) return;

    const newReq = await createRequest({
      userId: user?.id,
      userName: customerName,
      userEmail: email,
      userPhone: phone,
      orderId: orderId.trim() || undefined,
      category,
      subject,
      message,
    });

    if (newReq) {
      setSubmittedId(newReq.id);
      setSelectedTicketId(newReq.id);
    }
    setMessage('');
  };

  const handleSendReply = (requestId: string) => {
    if (!replyText.trim()) return;
    addMessage(
      requestId,
      replyText.trim(),
      user?.role === 'admin' ? 'support' : 'customer',
      user?.name || customerName || 'Customer'
    );
    setReplyText('');
  };

  const userTickets = user
    ? requests.filter((t: SupportRequest) => t.user_id === user.id || t.user_email === user.email)
    : requests.filter((t: SupportRequest) => t.id === submittedId);

  const activeConversation = requests.find((t: SupportRequest) => t.id === selectedTicketId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-10 mb-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Headphones className="w-4 h-4" />
            <span>Dedicated Nepal Customer Support</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-brand text-white">
            How can we assist you today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
            Whether you have questions about Cash on Delivery, order dispatch, product specifications, or returns, our team is standing by.
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2 shrink-0">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Support Desk Hours</span>
          </div>
          <p className="text-slate-300">Sunday - Friday: 9:00 AM - 7:00 PM</p>
          <p className="text-slate-300 font-mono">Email: cartplus.np@gmail.com</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Submit Ticket Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Submit a Support Ticket
              </h2>
            </div>

            {submittedId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your ticket <strong>{submittedId}</strong> has been logged. Our representative will follow up promptly!
                  </span>
                </div>
                <button
                  onClick={() => setSubmittedId(null)}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone (+977)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Order Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. CP-1758712345678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Support Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Order Help">Order Status & Modification</option>
                  <option value="Delivery Help">Delivery & Courier Inquiries</option>
                  <option value="Return/Refund Help">Returns, Replacement & Refunds</option>
                  <option value="Payment Help">Cash on Delivery & Payment Support</option>
                  <option value="Product Help">Product Details & Stock Inquiries</option>
                  <option value="General Support">General Feedback & Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of what you need help with"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue with relevant details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>

          {/* Frequently Asked Questions Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Common Help Topics & FAQ
              </h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {openFaq === idx && (
                    <div className="p-3.5 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tickets & Conversation Thread */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Your Support Activity ({userTickets.length})
            </h3>

            {userTickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No support tickets found for your current session. Submitting a ticket on the left will display live here.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
                {userTickets.map((t: SupportRequest) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                      selectedTicketId === t.id
                        ? 'border-amber-500 bg-amber-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-900">{t.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 truncate">{t.subject}</h4>
                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{t.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{t.category}</span>
                      <span>{t.messages.length} replies</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Conversation Live Thread */}
          {activeConversation && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Ticket Thread</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeConversation.subject}
                </h4>
                <span className="text-xs text-slate-500">
                  Status: <strong className="text-slate-800 uppercase">{activeConversation.status}</strong>
                </span>
              </div>

              {/* Original Message */}
              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[11px] text-slate-700">
                  <span>{activeConversation.user_name} (Original Request)</span>
                  <span className="text-slate-400 tabular-nums">
                    {new Date(activeConversation.created_at).toLocaleDateString('en-NP')}
                  </span>
                </div>
                <p className="text-slate-600">{activeConversation.message}</p>
              </div>

              {/* Replies */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {activeConversation.messages.map((reply: SupportMessage) => (
                  <div
                    key={reply.id}
                    className={`p-3 rounded-xl text-xs ${
                      reply.sender === 'support'
                        ? 'bg-amber-50 border border-amber-200 text-slate-900 ml-3'
                        : 'bg-slate-100 text-slate-800 mr-3'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span>{reply.sender_name} ({reply.sender === 'support' ? 'Support Desk' : 'Customer'})</span>
                      <span className="text-slate-400 tabular-nums">
                        {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p>{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a follow-up reply..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendReply(activeConversation.id);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(activeConversation.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Delivery & Service Policies Section */}
      <div className="mt-16 pt-12 border-t border-slate-200 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            CUSTOMER TRUST & GUIDELINES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-brand text-slate-900 mt-1">
            CARTPLUS Customer Policies & Delivery Information
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Transparent shipping timelines, safe payments, and hassle-free returns across all 7 provinces of Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Card 1: Delivery Coverage & Timelines */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Delivery Coverage & Timelines</h3>
            <ul className="text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Kathmandu Valley:</strong> 24 to 48 hours for Kathmandu, Lalitpur, and Bhaktapur.</li>
              <li><strong>Major Cities:</strong> 2 to 3 business days (Pokhara, Biratnagar, Chitwan, Butwal, Birgunj, Dharan).</li>
              <li><strong>Outer Districts:</strong> 3 to 5 business days for hill and remote regions.</li>
              <li>SMS and in-app tracking notifications provided at every dispatch stage.</li>
            </ul>
          </div>

          {/* Card 2: Delivery Fees & Free Shipping */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Shipping Fees & Free Delivery</h3>
            <ul className="text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>FREE Nationwide Delivery</strong> on all orders of Rs. 1,500 and above!</li>
              <li>Flat delivery charge of Rs. 100 within Kathmandu Valley for smaller orders.</li>
              <li>Flat delivery charge of Rs. 150 across provinces outside the valley.</li>
              <li>No extra hidden handling or packaging surcharges.</li>
            </ul>
          </div>

          {/* Card 3: Payment Options & Security */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Flexible Payment Options</h3>
            <ul className="text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Cash on Delivery (COD):</strong> Pay cash when your parcel arrives. Zero advance required.</li>
              <li><strong>eSewa & Khalti:</strong> Instant online checkout via Nepal&apos;s leading wallets.</li>
              <li><strong>Bank Cards:</strong> Visa, Mastercard, and SCT cards via 256-bit encrypted gateway.</li>
              <li>Official tax invoice / printable slip provided for every completed transaction.</li>
            </ul>
          </div>

          {/* Card 4: Inspection on Delivery */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Doorstep Inspection Policy</h3>
            <ul className="text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Customers are encouraged to inspect outer tamper-evident seals before payment.</li>
              <li>If the exterior box is crushed, torn, or unsealed, you may reject the parcel on the spot.</li>
              <li>Courier riders provide an official receipt or signed delivery note.</li>
            </ul>
          </div>

          {/* Card 5: 7-Day Replacement & Returns */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">7-Day Free Returns & Refunds</h3>
            <ul className="text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Eligible if the received item is defective, damaged during transit, or missing parts.</li>
              <li>Log a return request via this Customer Service portal within 7 days of delivery.</li>
              <li>Free courier pickup from your doorstep across Nepal.</li>
              <li>Full replacement or refund initiated within 48 hours of return inspection.</li>
            </ul>
          </div>

          {/* Card 6: Order Cancellation & Modification */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Order Updates & Help Desk</h3>
            <ul className="text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Free order cancellation anytime before merchant dispatch.</li>
              <li>Need to correct your phone number or ward address? Submit a ticket above!</li>
              <li>Live customer ticket support available Sunday to Friday, 9:00 AM - 7:00 PM.</li>
              <li>Official email support: cartplus.np@gmail.com.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
