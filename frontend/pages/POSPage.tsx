import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Send, CreditCard, X, ChefHat, Check, Tag } from 'lucide-react';
import backend from '~backend/client';
import { formatCurrency } from '../lib/format';
import { useToast } from '@/components/ui/use-toast';

interface CartItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  tax: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  price: number;
  tax: number;
  unit: string;
  is_available: boolean;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState<number | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      backend.products.list({}),
      backend.categories.list(),
      backend.tables.list(),
    ]).then(([p, c, t]) => {
      setProducts(p.products);
      setCategories(c.categories);
      setTables(t.tables.filter((tb: any) => tb.status === 'available'));
    }).catch(console.error);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === null || p.category_id === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQ.toLowerCase());
    return matchesCat && matchesSearch && p.is_available;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: product.id, product_name: product.name, unit_price: product.price, tax: product.tax, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(i => i.product_id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i);
      return updated.filter(i => i.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const taxTotal = cart.reduce((sum, i) => sum + (i.unit_price * i.quantity * i.tax / 100), 0);
  const total = subtotal + taxTotal - couponDiscount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await backend.coupons.validate({ code: couponCode, order_amount: subtotal });
      setCouponDiscount(res.discount_amount);
      setCouponId(res.coupon.id);
      toast({ title: 'Coupon applied!', description: `Saved ${formatCurrency(res.discount_amount)}` });
    } catch (e: any) {
      toast({ title: 'Invalid coupon', description: e.message, variant: 'destructive' });
      console.error(e);
    } finally {
      setCouponLoading(false);
    }
  };

  const sendToKitchen = async () => {
    if (cart.length === 0) return;
    setOrderLoading(true);
    try {
      const order = await backend.orders.create({
        table_id: selectedTable ?? undefined,
        items: cart.map(i => ({ product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, unit_price: i.unit_price, tax: i.tax })),
        discount: couponDiscount,
        coupon_id: couponId ?? undefined,
        source: 'POS',
      });
      setLastOrder(order);
      setCart([]);
      setCouponCode('');
      setCouponDiscount(0);
      setCouponId(null);
      toast({ title: 'Order sent to kitchen!', description: `Order #${order.order_number}` });
    } catch (e: any) {
      toast({ title: 'Failed to create order', description: e.message, variant: 'destructive' });
      console.error(e);
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePay = async () => {
    if (cart.length === 0) return;
    setOrderLoading(true);
    try {
      const order = await backend.orders.create({
        table_id: selectedTable ?? undefined,
        items: cart.map(i => ({ product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, unit_price: i.unit_price, tax: i.tax })),
        discount: couponDiscount,
        coupon_id: couponId ?? undefined,
        payment_method: payMethod,
        source: 'POS',
      });
      setLastOrder(order);
      setCart([]);
      setCouponCode('');
      setCouponDiscount(0);
      setCouponId(null);
      setPayModal(false);
      setSuccessModal(true);
    } catch (e: any) {
      toast({ title: 'Payment failed', description: e.message, variant: 'destructive' });
      console.error(e);
    } finally {
      setOrderLoading(false);
    }
  };

  const cashChange = parseFloat(cashGiven || '0') - total;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Product Panel */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Search + Category */}
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCat === null ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCat === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={selectedCat === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(product => {
            const cartItem = cart.find(i => i.product_id === product.id);
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left group relative"
              >
                <div className="w-full h-24 rounded-lg mb-3 flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${product.category_color ?? '#6366f1'}20` }}>
                  ☕
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mb-2">{product.category_name ?? 'Uncategorized'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-orange-600">{formatCurrency(product.price)}</span>
                  {cartItem && (
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                      {cartItem.quantity}
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={14} className="text-white" />
                </div>
              </button>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <Package size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No products found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-800">Order</h2>
            <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">{cart.length} items</span>
          </div>

          {/* Table Selector */}
          <div className="mt-3">
            <select
              value={selectedTable ?? ''}
              onChange={e => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">No table (takeaway)</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>Table {t.table_number} ({t.floor_name ?? 'Floor'})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <ShoppingCart size={40} />
              <p className="text-sm mt-2">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800 flex-1 pr-2">{item.product_name}</p>
                  <button onClick={() => removeFromCart(item.product_id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-gray-800 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Coupon */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="COUPON CODE"
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 uppercase"
              />
            </div>
            <button
              onClick={applyCoupon}
              disabled={couponLoading || !couponCode}
              className="px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-orange-600">{formatCurrency(Math.max(0, total))}</span>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={sendToKitchen}
            disabled={cart.length === 0 || orderLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm transition-colors"
          >
            <ChefHat size={16} />
            Send to Kitchen
          </button>
          <button
            onClick={() => setPayModal(true)}
            disabled={cart.length === 0 || orderLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-bold text-sm transition-colors shadow-lg shadow-orange-500/30"
          >
            <CreditCard size={16} />
            Pay {formatCurrency(Math.max(0, total))}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Payment</h3>
                <button onClick={() => setPayModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-5 text-center">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-3xl font-black text-orange-600">{formatCurrency(Math.max(0, total))}</p>
              </div>

              <div className="flex gap-2 mb-4">
                {['cash', 'card', 'upi'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${payMethod === m ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {payMethod === 'cash' && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Cash Given</label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={e => setCashGiven(e.target.value)}
                    placeholder={formatCurrency(total)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  {parseFloat(cashGiven) >= total && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg flex justify-between text-sm">
                      <span className="text-green-600 font-medium">Change:</span>
                      <span className="text-green-700 font-bold">{formatCurrency(cashChange)}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={orderLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/30"
              >
                <Check size={18} />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
            <p className="text-gray-500 text-sm mb-1">Order #{lastOrder?.order_number}</p>
            <p className="text-2xl font-black text-orange-600 mb-5">{formatCurrency(lastOrder?.total ?? 0)}</p>
            <button
              onClick={() => setSuccessModal(false)}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  );
}
