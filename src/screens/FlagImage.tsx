import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

// ISO 3166-1 alpha-2 коды для каждой валюты
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: 'us', EUR: 'eu', RUB: 'ru', GBP: 'gb',
  CNY: 'cn', JPY: 'jp', CHF: 'ch', KZT: 'kz',
  KGS: 'kg', TRY: 'tr', AED: 'ae', UAH: 'ua',
  CAD: 'ca', AUD: 'au', SEK: 'se', NOK: 'no',
  DKK: 'dk', PLN: 'pl', SGD: 'sg', HKD: 'hk',
  INR: 'in', BRL: 'br', MYR: 'my', THB: 'th',
  CZK: 'cz', HUF: 'hu', RON: 'ro', BGN: 'bg',
  HRK: 'hr', ISK: 'is', NZD: 'nz', ZAR: 'za',
  MXN: 'mx', ILS: 'il', PHP: 'ph', IDR: 'id',
  VND: 'vn', EGP: 'eg', PKR: 'pk', BDT: 'bd',
  UZS: 'uz', GEL: 'ge', AMD: 'am', AZN: 'az',
  BYN: 'by', MDL: 'md', TJS: 'tj', TMT: 'tm',
  KWD: 'kw', BHD: 'bh', QAR: 'qa', OMR: 'om',
  JOD: 'jo', LBP: 'lb', SAR: 'sa', IQD: 'iq',
  IRR: 'ir', DZD: 'dz', MAD: 'ma', TND: 'tn',
  LYD: 'ly', SDG: 'sd', ETB: 'et', KES: 'ke',
  NGN: 'ng', GHS: 'gh', UGX: 'ug', TZS: 'tz',
  XOF: 'sn', XAF: 'cm', CLP: 'cl', ARS: 'ar',
  COP: 'co', PEN: 'pe', VEF: 've', UYU: 'uy',
  BOB: 'bo', PYG: 'py', CRC: 'cr', GTQ: 'gt',
  HNL: 'hn', NIO: 'ni', PAB: 'pa', DOP: 'do',
  CUP: 'cu', JMD: 'jm', TTD: 'tt', BBD: 'bb',
  TWD: 'tw', KRW: 'kr', MNT: 'mn', LAK: 'la',
  KHR: 'kh', MMK: 'mm', BND: 'bn', LKR: 'lk',
  NPR: 'np', BTN: 'bt', MVR: 'mv', AFN: 'af',
};

interface FlagImageProps {
  currencyCode: string;
  size?: number;
}

export default function FlagImage({ currencyCode, size = 28 }: FlagImageProps) {
  const countryCode = CURRENCY_TO_COUNTRY[currencyCode];
  
  if (!countryCode) {
    // Fallback: цветной квадрат с кодом
    return (
      <View style={[styles.fallback, { width: size, height: size * 0.67, borderRadius: 3 }]}>
      </View>
    );
  }

  // flagcdn.com — надёжный бесплатный CDN для флагов, работает на Android
  const uri = `https://flagcdn.com/w40/${countryCode}.png`;

  return (
    <Image
      source={{ uri }}
      style={{
        width: size,
        height: size * 0.67,
        borderRadius: 3,
      }}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#1E2D45',
  },
});
