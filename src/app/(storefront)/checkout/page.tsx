"use client";

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface Region {
  id: string;
  name: string;
}

interface ShippingRate {
  courier: string;
  price: number;
  estimatedDate?: string;
  unsupported?: boolean;
  quoteToken: string;
}

interface MengantarLocation {
  _id: string;
  CITY_NAME?: string;
  PROVINCE_NAME?: string;
  SUBDISTRICT_NAME?: string;
  ZIP_CODE?: string;
}

interface SnapPaymentCallbacks {
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: SnapPaymentCallbacks) => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    email: "",
    newsletter: true,
    country: "Indonesia",
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    phone: "",
    saveInfo: false,
    paymentMethod: "midtrans",
    billingAddress: "same",
  });

  // State Wilayah Berjenjang
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  
  // State Ekspedisi & Dropdown Kurir Lainnya
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [mengantarLocation, setMengantarLocation] = useState<MengantarLocation | null>(null);
  const [showAllCouriers, setShowAllCouriers] = useState(false);
  
  // Mobile Order Summary Toggle State
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalAmount = subtotal + (selectedRate ? selectedRate.price : 0);

  const formatRupiah = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0 : amount;
    return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num);
  };

  // Helper render harga keranjang (Mendukung Strikethrough Discount)
  const renderCartItemPrice = (item: CartItem) => {
    const currentPrice = typeof item.price === "string" ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : item.price;
    // Cari regular price jika tersedia (pastikan dari CartContext di-passing)
    const regPrice = item.regular_price || item.regularPrice || item.originalPrice || 0;
    const regularPriceParsed = typeof regPrice === "string" ? parseFloat(regPrice.replace(/[^0-9.-]+/g, "")) : regPrice;

    if (regularPriceParsed > currentPrice) {
      return (
        <div className="flex flex-col items-end whitespace-nowrap">
          <span className="text-[11px] text-neutral-400 line-through leading-none mb-0.5">{formatRupiah(regularPriceParsed)}</span>
          <span className="text-[13px] font-bold text-red-600 leading-none">{formatRupiah(currentPrice)}</span>
        </div>
      );
    }
    return <span className="text-[13px] font-medium text-black whitespace-nowrap">{formatRupiah(currentPrice)}</span>;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchMengantarRates = useCallback(async (keyword: string) => {
    setIsLoadingRates(true);
    setErrorMessage("");
    setShippingRates([]);
    setSelectedRate(null);
    setShowAllCouriers(false);

    try {
      const searchRes = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "searchLocation", keyword }),
      });
      const searchData = (await searchRes.json()) as { data?: MengantarLocation[] };

      if (searchData.data?.length) {
        const bestMatch = searchData.data[0];
        setMengantarLocation(bestMatch);

        const rateRes = await fetch("/api/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "getRates",
            destination_id: bestMatch._id,
            items: cart.map(({ id, quantity }) => ({ id, quantity })),
            location: bestMatch,
          }),
        });
        const rateData = (await rateRes.json()) as {
          success?: boolean;
          data?: Record<string, Omit<ShippingRate, "courier">>;
        };

        if (rateData.success && rateData.data) {
          const ratesArray = Object.entries(rateData.data)
            .map(([courier, rate]) => ({ courier, ...rate }))
            .filter((rate) => !rate.unsupported && rate.price > 0)
            .filter((rate) => !rate.courier.toUpperCase().includes("TESTING") && !rate.courier.toUpperCase().includes("INTERNAL"))
            .sort((a, b) => a.price - b.price);

          setShippingRates(ratesArray);
          setSelectedRate(ratesArray[0] ?? null);
        }
      } else {
        setErrorMessage("Courier services do not cover this district yet.");
      }
    } catch {
      setErrorMessage("An error occurred while calculating shipping rates.");
    } finally {
      setIsLoadingRates(false);
    }
  }, [cart]);

  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => console.error("Failed to load provinces"));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const provId = provinces.find((p) => p.name === selectedProvince)?.id;
      if (provId) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
          .then((res) => res.json())
          .then((data) => setCities(data));
      }
    }
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (selectedCity) {
      const cityId = cities.find((c) => c.name === selectedCity)?.id;
      if (cityId) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`)
          .then((res) => res.json())
          .then((data) => setDistricts(data));
      }
    }
  }, [selectedCity, cities]);

  const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(event.target.value);
    setSelectedCity("");
    setSelectedDistrict("");
    setCities([]);
    setDistricts([]);
    setShippingRates([]);
    setSelectedRate(null);
  };

  const handleCityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
    setSelectedDistrict("");
    setDistricts([]);
    setShippingRates([]);
    setSelectedRate(null);
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    if (selectedProvince && selectedCity && district) {
      const cleanCity = selectedCity.replace(/^(KOTA|KABUPATEN)\s+/i, "");
      void fetchMengantarRates(`${district} ${cleanCity}`);
    }
  };

  const handlePayNow = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.firstName || !formData.address || !formData.phone) {
      return setErrorMessage("Please complete your email, name, address, and phone number.");
    }

    if (!selectedDistrict || !selectedRate || !mengantarLocation) {
      return setErrorMessage("Please select your delivery region and shipping method.");
    }

    if (cart.length === 0) {
      return setErrorMessage("Your shopping cart is empty.");
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            ...formData,
            cityName: mengantarLocation.CITY_NAME || selectedCity,
            provinceName: mengantarLocation.PROVINCE_NAME || selectedProvince,
            district: mengantarLocation.SUBDISTRICT_NAME || selectedDistrict,
            postalCode: formData.postalCode || mengantarLocation.ZIP_CODE || "",
            shippingCost: selectedRate.price,
            shippingMethodName: `${selectedRate.courier} (${selectedRate.estimatedDate || "-"})`
          },
          items: cart,
          shippingQuoteToken: selectedRate.quoteToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.message || "Failed to process payment");

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => { clearCart(); router.push(`/order-success?order_id=${data.orderId}`); },
          onPending: () => { clearCart(); router.push(`/order-success?order_id=${data.orderId}`); },
          onError: () => setErrorMessage("Payment failed. Please try again."),
          onClose: () => setIsLoading(false),
        });
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "System error encountered.");
      setIsLoading(false);
    }
  };

  const snapScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith("SB-") 
    ? "https://app.sandbox.midtrans.com/snap/snap.js" 
    : "https://app.midtrans.com/snap/snap.js";

  return (
    <>
      <Script src={snapScriptUrl} data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
      <style dangerouslySetInnerHTML={{ __html: `header, footer { display: none !important; } body { background-color: #ffffff; }` }} />

      <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">
        
        {/* MOBILE ACCORDION ORDER SUMMARY (Top on Mobile) */}
        <div className="lg:hidden border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-[1000px] px-5 py-4 flex items-center justify-between cursor-pointer" onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}>
            <div className="flex items-center gap-2 text-[14px] text-black font-medium">
              <span>{isMobileSummaryOpen ? "Hide order summary" : "Show order summary"}</span>
              <svg className={`h-4 w-4 transition-transform ${isMobileSummaryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
            <span className="text-[15px] font-bold text-black">{formatRupiah(totalAmount)}</span>
          </div>

          {isMobileSummaryOpen && (
            <div className="px-5 pb-6 border-t border-neutral-200 space-y-4 pt-4 bg-white">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative h-[56px] w-[56px] shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                        <Image src={item.image || item.image_url || "/placeholder.jpg"} alt={item.name} fill sizes="56px" className="object-cover object-center rounded-md p-1" />
                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-500 text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                        <span className="text-[13px] font-medium text-neutral-900 leading-snug break-words">{item.name}</span>
                        {item.selectedAttributes && (
                          <span className="text-[12px] text-neutral-500 mt-0.5">{Object.values(item.selectedAttributes).join(" / ")}</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-0.5 shrink-0">
                      {renderCartItemPrice(item)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-3 space-y-2 text-[13px]">
                <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>{selectedRate ? formatRupiah(selectedRate.price) : "Calculated at next step"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[1000px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            
            {/* KOLOM KIRI: FORM */}
            <div className="px-5 py-8 sm:px-10 lg:py-14 lg:pr-12 lg:border-r lg:border-neutral-200">
              <div className="mb-8">
                 <Link href="/" className="text-xl font-bold tracking-widest text-black uppercase">NORTHRE®</Link>
              </div>

              <form onSubmit={handlePayNow} className="space-y-8">
                
                {/* Contact */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[17px] font-semibold text-black">Contact</h2>
                    <button type="button" className="text-[13px] text-black hover:underline font-medium transition-colors">Sign in</button>
                  </div>
                  <input type="email" name="email" required placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                  <label className="mt-3 flex items-center gap-2.5 text-[13px] text-neutral-600 cursor-pointer">
                    <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleInputChange} className="h-4 w-4 rounded-[3px] border-neutral-300 text-black focus:ring-black accent-black" />
                    Email me with news and offers
                  </label>
                </div>

                {/* Delivery */}
                <div className="space-y-3.5">
                  <h2 className="text-[17px] font-semibold text-black mb-3">Delivery</h2>
                  
                  <div className="relative">
                    <select value={formData.country} onChange={handleInputChange} name="country" className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none appearance-none cursor-pointer transition-all">
                      <option value="Indonesia">Indonesia</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="h-3 w-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <input type="text" name="firstName" required placeholder="First name" value={formData.firstName} onChange={handleInputChange} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                    <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                  </div>

                  <input type="text" name="address" required placeholder="Address (Street, House No, RT/RW)" value={formData.address} onChange={handleInputChange} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all" />

                  {/* DROPDOWN 1: PROVINSI */}
                  <div className="relative">
                    <select
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((prov) => (
                        <option key={prov.id} value={prov.name}>{prov.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="h-3 w-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>

                  {/* DROPDOWN 2: KOTA / KABUPATEN */}
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={handleCityChange}
                      disabled={!selectedProvince}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none appearance-none disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <option value="">Select City / Regency</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="h-3 w-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* DROPDOWN 3: KECAMATAN */}
                    <div className="relative">
                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedCity}
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none appearance-none disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer transition-all"
                      >
                        <option value="">Select District</option>
                        {districts.map((dist) => (
                          <option key={dist.id} value={dist.name}>{dist.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-3 w-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>

                    <input type="text" name="postalCode" placeholder="Postal code" value={formData.postalCode} onChange={handleInputChange} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                  </div>

                  <input type="tel" name="phone" required placeholder="Phone number" value={formData.phone} onChange={handleInputChange} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all" />

                  <label className="mt-3 flex items-center gap-2.5 text-[13px] text-neutral-600 cursor-pointer">
                    <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleInputChange} className="h-4 w-4 rounded-[3px] border-neutral-300 text-black focus:ring-black accent-black" />
                    Save this information for next time
                  </label>
                </div>

                {/* Shipping Method */}
                <div>
                  <h2 className="text-[17px] font-semibold text-black mb-3">Shipping method</h2>
                  
                  {!selectedDistrict ? (
                    <div className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4 text-center text-[13px] text-neutral-500">
                      Enter your shipping address to view available shipping methods.
                    </div>
                  ) : isLoadingRates ? (
                    <div className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4 text-center text-[13px] text-black animate-pulse font-medium">
                      Calculating best shipping rates...
                    </div>
                  ) : shippingRates.length > 0 ? (
                    <div className="space-y-3">
                      {/* CARD UTAMA: Best Value (Auto-Selected) */}
                      {selectedRate && (
                        <div className="relative rounded-md border-2 border-black bg-neutral-50 p-4 flex items-center justify-between shadow-sm">
                          <div className="absolute top-2 right-3 text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                            Best Value
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-black bg-black">
                              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                            </div>
                            <div>
                              <span className="text-[14px] font-bold text-black uppercase block">{selectedRate.courier}</span>
                              <span className="text-[11px] text-neutral-500">Estimated {selectedRate.estimatedDate || "2-4 days"}</span>
                            </div>
                          </div>
                          <span className="text-[14px] font-bold text-black">{formatRupiah(selectedRate.price)}</span>
                        </div>
                      )}

                      {/* TOMBOL TOGGLE: Other Couriers */}
                      {shippingRates.length > 1 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowAllCouriers(!showAllCouriers)}
                            className="w-full py-2.5 text-center text-[12px] font-medium text-black hover:text-neutral-700 transition-colors border border-dashed border-neutral-300 rounded-md bg-white flex items-center justify-center gap-1.5"
                          >
                            <span>{showAllCouriers ? "Hide other couriers" : `View other couriers (${shippingRates.length - 1})...`}</span>
                            <svg className={`h-3 w-3 transition-transform ${showAllCouriers ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                          </button>

                          {/* LIST KURIR LAINNYA */}
                          {showAllCouriers && (
                            <div className="mt-2 rounded-md border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-100">
                              {shippingRates.map((rate) => (
                                <label
                                  key={rate.courier}
                                  onClick={() => setSelectedRate(rate)}
                                  className={`flex cursor-pointer items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors ${selectedRate?.courier === rate.courier ? "bg-neutral-50" : ""}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`flex h-[14px] w-[14px] items-center justify-center rounded-full border ${selectedRate?.courier === rate.courier ? "border-black bg-black" : "border-neutral-400"}`}>
                                      {selectedRate?.courier === rate.courier && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-medium text-black uppercase">{rate.courier}</span>
                                      <span className="text-[10px] text-neutral-500">{rate.estimatedDate}</span>
                                    </div>
                                  </div>
                                  <span className="text-[13px] font-semibold text-black">{formatRupiah(rate.price)}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-4 text-center text-[13px] text-red-600">
                      No courier available for this destination.
                    </div>
                  )}
                </div>

                {/* Pembayaran */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-[17px] font-semibold text-black">Payment</h2>
                  <p className="text-[13px] text-neutral-500">All transactions are secure and encrypted.</p>

                  <div className={`overflow-hidden rounded-md border ${formData.paymentMethod === "midtrans" ? "border-black" : "border-neutral-300"} bg-white transition-colors shadow-sm`}>
                    <div className={`flex items-center justify-between border-b border-neutral-200 p-4 ${formData.paymentMethod === "midtrans" ? "bg-neutral-50" : "bg-white"}`}>
                      <label className="flex flex-1 items-center gap-3 cursor-pointer">
                        <div className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${formData.paymentMethod === "midtrans" ? "border-black bg-black" : "border-neutral-400"}`}>
                          {formData.paymentMethod === "midtrans" && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                        </div>
                        <input type="radio" name="paymentMethod" value="midtrans" checked={formData.paymentMethod === "midtrans"} onChange={handleInputChange} className="hidden" />
                        <span className="text-[14px] font-medium text-black">Midtrans Payment</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-9 items-center justify-center rounded border border-neutral-200 bg-white text-[8px] font-extrabold text-[#003399]">BCA</span>
                        <span className="flex h-6 w-9 items-center justify-center rounded border border-neutral-200 bg-white text-[7px] font-extrabold text-[#003e7e]">MANDIRI</span>
                        <span className="flex h-6 w-9 items-center justify-center rounded border border-neutral-200 bg-white text-[8px] font-extrabold text-[#00a54f]">PERMATA</span>
                        <span className="flex h-6 w-8 items-center justify-center rounded border border-neutral-200 bg-white text-[9px] font-semibold text-neutral-500">+16</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 text-[13px] leading-relaxed text-neutral-600 text-center">
                      Payment methods: Go-Pay, Credit Card, Virtual Account Transfer, and Alfamart.
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-md bg-red-50 p-3 text-[13px] text-red-600 border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full rounded-md bg-black py-[18px] text-[15px] font-bold text-white tracking-wide transition-all hover:bg-neutral-800 disabled:opacity-50">
                  {isLoading ? "PROCESSING..." : "Pay now"}
                </button>
              </form>
            </div>

            {/* KOLOM KANAN: RINGKASAN PRODUK (Desktop View) */}
            <div className="hidden lg:block px-5 py-8 sm:px-10 lg:py-14 lg:pl-10 bg-neutral-50/50">
              <div className="sticky top-14 space-y-5">
                
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      
                      {/* Flex-1 min-w-0 penting agar teks panjang memotong secara aman tanpa mendorong elemen harga ke samping */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="relative h-[64px] w-[64px] shrink-0 rounded-md border border-neutral-200 bg-white">
                          <Image src={item.image || item.image_url || "/placeholder.jpg"} alt={item.name} fill sizes="64px" className="object-cover object-center rounded-[5px] p-1" />
                          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-500 bg-opacity-95 text-[11px] font-bold text-white shadow-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0 pt-1">
                          <span className="text-[13px] font-semibold text-black leading-snug break-words">{item.name}</span>
                          {item.selectedAttributes && (
                            <span className="text-[12px] text-neutral-500 mt-0.5">{Object.values(item.selectedAttributes).join(" / ")}</span>
                          )}
                        </div>
                      </div>

                      {/* Render Kolom Harga (Termasuk Logika Diskon & Coret) */}
                      <div className="pt-1 shrink-0">
                        {renderCartItemPrice(item)}
                      </div>

                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 my-5"></div>

                <div className="flex gap-3">
                  <input type="text" placeholder="Discount code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-3 text-[13px] text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none shadow-sm transition-all" />
                  <button type="button" className="rounded-md border border-neutral-300 bg-neutral-100 px-5 py-3 text-[14px] font-medium text-black hover:bg-neutral-200 transition-colors shadow-sm">Apply</button>
                </div>

                <div className="border-t border-neutral-200 my-5"></div>

                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-black">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className={selectedRate ? "font-medium text-black" : "text-[12px] text-neutral-500"}>
                      {selectedRate ? formatRupiah(selectedRate.price) : "Calculated at next step"}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 my-5"></div>
                
                <div className="flex items-center justify-between text-black">
                    <span className="text-[16px] font-medium">Total</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-neutral-500">IDR</span>
                      <span className="text-[22px] font-semibold tracking-tight">{formatRupiah(totalAmount)}</span>
                    </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
