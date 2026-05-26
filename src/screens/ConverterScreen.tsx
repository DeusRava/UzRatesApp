import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { fetchRates, Rate, CURRENCY_FLAGS, convert, formatNumber } from '../utils/api';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 100000];

function CurrencyPicker({
  visible, rates, onSelect, onClose, excludeCode,
}: {
  visible: boolean; rates: Rate[]; onSelect: (r: Rate | 'UZS') => void;
  onClose: () => void; excludeCode: string;
}) {
  const [search, setSearch] = useState('');
  const allList: Array<Rate | { code: string; nameRu: string; rate: number; diff: number; nominal: number; name: string; date: string }> = [
    { code: 'UZS', nameRu: 'Узбекский сум', rate: 1, diff: 0, nominal: 1, name: 'Uzbekistani Sum', date: '' },
    ...rates,
  ];
  const filtered = search
    ? allList.filter(r => r.code.toUpperCase().includes(search.toUpperCase()) || r.nameRu.toUpperCase().includes(search.toUpperCase()))
    : allList;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={styles.pickerBackdrop} onPress={onClose} />
        <View style={styles.pickerSheet}>
          <Text style={styles.pickerTitle}>Выберите валюту</Text>
          <View style={styles.pickerSearch}>
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Поиск..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="characters"
              autoFocus
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={r => r.code}
            renderItem={({ item }) => {
              const flag = CURRENCY_FLAGS[item.code] || '🏳️';
              const isSelected = item.code === excludeCode;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => { onSelect(item.code === 'UZS' ? 'UZS' : item as Rate); onClose(); setSearch(''); }}
                >
                  <Text style={styles.pickerFlag}>{flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerCode}>{item.code}</Text>
                    <Text style={styles.pickerName} numberOfLines={1}>{item.nameRu}</Text>
                  </View>
                  {isSelected && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              );
            }}
            style={{ maxHeight: 380 }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function ConverterScreen() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('UZS');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState('');
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  useEffect(() => {
    fetchRates().then(data => { setRates(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!rates.length || !amount) { setResult(''); return; }
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num)) { setResult(''); return; }
    const res = convert(rates, fromCode, toCode, num);
    setResult(formatNumber(res));
  }, [rates, fromCode, toCode, amount]);

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    setAmount(result.replace(/\s/g, ''));
  };

  const getFlag = (code: string) => CURRENCY_FLAGS[code] || '🏳️';
  const getName = (code: string) => {
    if (code === 'UZS') return 'Узбекский сум';
    return rates.find(r => r.code === code)?.nameRu || code;
  };
  const getRate = (code: string) => {
    if (code === 'UZS') return null;
    return rates.find(r => r.code === code);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const fromRate = getRate(fromCode);
  const toRate = getRate(toCode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>🔄 Конвертер</Text>
      <Text style={styles.subtitle}>Курс ЦБ Узбекистана</Text>

      {/* FROM */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Из</Text>
        <TouchableOpacity style={styles.currencySelector} onPress={() => setShowFrom(true)}>
          <Text style={styles.selectorFlag}>{getFlag(fromCode)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorCode}>{fromCode}</Text>
            <Text style={styles.selectorName} numberOfLines={1}>{getName(fromCode)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="Введите сумму"
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.accent}
        />
        {fromRate && (
          <Text style={styles.rateHint}>
            1 {fromCode} = {fromRate.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} сум
          </Text>
        )}
      </View>

      {/* SWAP */}
      <TouchableOpacity style={styles.swapBtn} onPress={swap}>
        <Text style={styles.swapIcon}>⇅</Text>
        <Text style={styles.swapText}>Поменять</Text>
      </TouchableOpacity>

      {/* TO */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>В</Text>
        <TouchableOpacity style={styles.currencySelector} onPress={() => setShowTo(true)}>
          <Text style={styles.selectorFlag}>{getFlag(toCode)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorCode}>{toCode}</Text>
            <Text style={styles.selectorName} numberOfLines={1}>{getName(toCode)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{result || '—'}</Text>
          <Text style={styles.resultCode}>{toCode}</Text>
        </View>
        {toRate && (
          <Text style={styles.rateHint}>
            1 {toCode} = {toRate.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} сум
          </Text>
        )}
      </View>

      {/* Quick amounts */}
      <Text style={styles.quickLabel}>Быстрый ввод</Text>
      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map(n => (
          <TouchableOpacity key={n} style={styles.quickBtn} onPress={() => setAmount(String(n))}>
            <Text style={styles.quickText}>{n >= 1000 ? `${n / 1000}K` : n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cross rates */}
      {fromCode !== 'UZS' && toCode !== 'UZS' && fromRate && toRate && (
        <View style={styles.crossBlock}>
          <Text style={styles.crossTitle}>Кросс-курс</Text>
          <Text style={styles.crossRate}>
            1 {fromCode} = {formatNumber(convert(rates, fromCode, toCode, 1))} {toCode}
          </Text>
          <Text style={styles.crossRate}>
            1 {toCode} = {formatNumber(convert(rates, toCode, fromCode, 1))} {fromCode}
          </Text>
        </View>
      )}

      <CurrencyPicker
        visible={showFrom} rates={rates} excludeCode={fromCode}
        onSelect={r => setFromCode(typeof r === 'string' ? r : r.code)}
        onClose={() => setShowFrom(false)}
      />
      <CurrencyPicker
        visible={showTo} rates={rates} excludeCode={toCode}
        onSelect={r => setToCode(typeof r === 'string' ? r : r.code)}
        onClose={() => setShowTo(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },

  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: SPACING.lg },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.lg },

  block: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  blockLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },

  currencySelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  selectorFlag: { fontSize: 32, marginRight: 12 },
  selectorCode: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  selectorName: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  chevron: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },

  amountInput: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md,
    padding: SPACING.md, color: COLORS.text, fontSize: 24,
    fontWeight: '700', borderWidth: 1, borderColor: COLORS.borderLight,
    letterSpacing: -0.5,
  },

  resultBox: {
    backgroundColor: COLORS.accentSoft, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultValue: { color: COLORS.accent, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, flex: 1 },
  resultCode: { color: COLORS.accent, fontSize: 16, fontWeight: '700', opacity: 0.7 },

  rateHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 8 },

  swapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, marginVertical: 2,
  },
  swapIcon: { color: COLORS.accent, fontSize: 20, marginRight: 6 },
  swapText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },

  quickLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginTop: SPACING.md, marginBottom: 8 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  quickBtn: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  quickText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },

  crossBlock: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm,
  },
  crossTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  crossRate: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },

  pickerOverlay: { flex: 1, justifyContent: 'flex-end' },
  pickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  pickerSheet: {
    backgroundColor: COLORS.bgCardAlt, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight,
    maxHeight: '80%',
  },
  pickerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  pickerSearch: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pickerSearchInput: { color: COLORS.text, padding: 12, fontSize: 15 },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pickerItemSelected: { opacity: 0.5 },
  pickerFlag: { fontSize: 24, marginRight: 12 },
  pickerCode: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  pickerName: { color: COLORS.textMuted, fontSize: 12 },
  pickerCheck: { color: COLORS.accent, fontSize: 18 },
});
