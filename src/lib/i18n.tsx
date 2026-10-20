import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'en' | 'tl';

const dict = {
  en: {
    welcome: 'Welcome back',
    todayEarnings: "Today's Earnings",
    acceptOffer: 'Accept Offer',
    markDelivered: 'Mark as Delivered',
    navigateDropoff: 'Navigate to Dropoff',
    confirmHandoff: 'Confirm only upon successful handoff',
    scanBarcode: 'Scan Barcode',
    takePhoto: 'Take Photo',
    itemVerified: 'Item verified!',
    photoUploaded: 'Photo proof uploaded!',
    earningsAdded: 'Earnings added to wallet.',
    allItemsScanned: 'All Items Scanned — Continue',
    backToOffers: 'Back to Offers',
    offerDetails: 'Offer Details',
    reviewBefore: 'Review before accepting',
    totalPayable: 'Total Estimated Payable',
    costBreakdown: 'Cost Breakdown',
    baseFare: 'Base Fare',
    tollFees: 'Toll / Skyway Fees',
    liveOrders: 'Live Orders',
    createOrder: 'Create Order',
    drivers: 'Drivers',
    merchants: 'Merchants',
    liveMap: 'Live Map',
    selectRole: 'Select Your Role',
    admin: 'Admin',
    developer: 'Developer',
    customer: 'Customer (Test)',
    rider: 'Rider (Test)',
    language: 'Language',
  },
  tl: {
    welcome: 'Mabalik ka',
    todayEarnings: 'Kinita Ngayon',
    acceptOffer: 'Tanggapin',
    markDelivered: 'Naihatid Na',
    navigateDropoff: 'Patungo sa Dropoff',
    confirmHandoff: 'Kumpirmahin lamang kapag naihatid na',
    scanBarcode: 'I-scan ang Barcode',
    takePhoto: 'Kumuha ng Litrato',
    itemVerified: 'Na-verify ang item!',
    photoUploaded: 'Na-upload ang proof photo!',
    earningsAdded: 'Idinagdag sa wallet ang kita.',
    allItemsScanned: 'Lahat Nai-scan — Magpatuloy',
    backToOffers: 'Bumalik sa Offers',
    offerDetails: 'Detalye ng Offer',
    reviewBefore: 'Suriin bago tanggapin',
    totalPayable: 'Kabuuang Tatantyahing Babayaran',
    costBreakdown: 'Pagbubuo ng Gastos',
    baseFare: 'Pangunahing Pamasahe',
    tollFees: 'Toll / Skyway Bayad',
    liveOrders: 'Mga Live Orders',
    createOrder: 'Gumawa ng Order',
    drivers: 'Mga Driver',
    merchants: 'Mga Merchant',
    liveMap: 'Live Mapa',
    selectRole: 'Piliin ang Iyong Role',
    admin: 'Admin',
    developer: 'Developer',
    customer: 'Kustomer (Test)',
    rider: 'Rider (Test)',
    language: 'Wika',
  },
};

export type DictKey = keyof typeof dict.en;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = useCallback((key: DictKey) => dict[lang][key] ?? dict.en[key] ?? key, [lang]);
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be inside LanguageProvider');
  return ctx;
}
