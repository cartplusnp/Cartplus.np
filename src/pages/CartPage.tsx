import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter, Link } from '../context/RouterContext';
import { EmptyState } from '../components/common/EmptyState';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  Sparkles,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
    getCartSubtotal,
    getCartDiscount,
    getDeliveryFee,
    getCartTotal,
  } = useCart();
  const { navigate } = useRouter();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const subtotal = getCartSubtotal();
  const savings = getCartDiscount();
  const deliveryFee = getDeliveryFee();
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.05) : 0;
  const finalTotal = Math.max(0, getCartTotal() - promoDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'CARTPLUS5' || promoCode.trim().toUpperCase() === 'GRANDOPEN') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try CARTPLUS5 for 5% off!');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 stroke-1 text-slate-400" />}
          title="Your Shopping Cart is Empty"
          description="You haven't added any items to your CARTPLUS shopping bag yet. Explore our top deals and curated categories."
          actionText="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your chosen items before heading to simple Cash on Delivery checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List Left */}
        <div className="lg:col-span-8 space-y-4">
          {/* Transparent courier delivery badge */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Standard Reliable Doorstep Delivery across all 7 Provinces of Nepal. Cash on Delivery supported.
              </span>
            </div>
            <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">Rs. 120</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    onClick={() => navigate(`/products/${product.slug}`)}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img
                      src={product.thumbnail || product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => navigate(`/products/${product.slug}`)}
                      className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-950 tabular-nums">
                        Rs. {product.price.toLocaleString('en-NP')}
                      </span>
                      {product.original_price > product.price && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          Rs. {product.original_price.toLocaleString('en-NP')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stepper and Line Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(product.id)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => increaseQuantity(product.id)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm font-black text-slate-900 tabular-nums">
                      Rs. {(product.price * quantity).toLocaleString('en-NP')}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Right */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((c, i) => c + i.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  Rs. {subtotal.toLocaleString('en-NP')}
                </span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Discounts</span>
                  <span className="tabular-nums">- Rs. {savings.toLocaleString('en-NP')}</span>
                </div>
              )}

              {promoApplied && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Code Discount</span>
                  <span className="tabular-nums">- Rs. {promoDiscount.toLocaleString('en-NP')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span className="font-bold tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 uppercase font-extrabold">FREE</span>
                  ) : (
                    `Rs. ${deliveryFee.toLocaleString('en-NP')}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">Total</span>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-950 font-brand tabular-nums">
                    Rs. {finalTotal.toLocaleString('en-NP')}
                  </div>
                  <span className="text-[10px] text-slate-400">Includes all taxes</span>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="pt-3 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (try CARTPLUS5)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 uppercase font-semibold focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{promoError}</p>
              )}
              {promoApplied && (
                <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">
                  Promo CARTPLUS5 applied successfully!
                </p>
              )}
            </form>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-500/20"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure Checkout with Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
