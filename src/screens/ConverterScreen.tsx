import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { fetchRates, Rate, convert, formatNumber } from '../utils/api';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import FlagImage from './FlagImage';

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
          <View style={styles.pickerHandle} />
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
              const isSelected = item.code === excludeCode;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => { onSelect(item.code === 'UZS' ? 'UZS' : item as Rate); onClose(); setSearch(''); }}
                >
                  <View style={styles.pickerFlagWrap}>
                    <FlagImage currencyCode={item.code} size={32} />
                  </View>
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
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerLabel}>КОНВЕРТЕР</Text>
          <Text style={styles.headerTitle}>Обмен валют</Text>
        </View>
      </View>

      {/* FROM block */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Отдаю</Text>
        <TouchableOpacity style={styles.currencySelector} onPress={() => setShowFrom(true)}>
          <View style={styles.flagWrap}>
            <FlagImage currencyCode={fromCode} size={36} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorCode}>{fromCode}</Text>
            <Text style={styles.selectorName} numberOfLines={1}>{getName(fromCode)}</Text>
          </View>
          <View style={styles.chevronWrap}>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.accent}
        />
        {fromRate && (
          <Text style={styles.rateHint}>
            1 {fromCode} = {fromRate.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} UZS
          </Text>
        )}
      </View>

      {/* Swap button */}
      <TouchableOpacity style={styles.swapBtn} onPress={swap}>
        <Text style={styles.swapIcon}>⇅</Text>
        <Text style={styles.swapText}>Поменять</Text>
      </TouchableOpacity>

      {/* TO block */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Получаю</Text>
        <TouchableOpacity style={styles.currencySelector} onPress={() => setShowTo(true)}>
          <View style={styles.flagWrap}>
            <FlagImage currencyCode={toCode} size={36} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorCode}>{toCode}</Text>
            <Text style={styles.selectorName} numberOfLines={1}>{getName(toCode)}</Text>
          </View>
          <View style={styles.chevronWrap}>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{result || '—'}</Text>
          <Text style={styles.resultCode}>{toCode}</Text>
        </View>
        {toRate && (
          <Text style={styles.rateHint}>
            1 {toCode} = {toRate.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} UZS
          </Text>
        )}
      </View>

      {/* Quick amounts */}
      <Text style={styles.sectionLabel}>Быстрый ввод</Text>
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
          <Text style={styles.sectionLabel}>Кросс-курс</Text>
          <View style={styles.crossRow}>
            <Text style={styles.crossRate}>
              1 {fromCode} = <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{formatNumber(convert(rates, fromCode, toCode, 1))}</Text> {toCode}
            </Text>
          </View>
          <View style={[styles.crossRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.crossRate}>
              1 {toCode} = <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{formatNumber(convert(rates, toCode, fromCode, 1))}</Text> {fromCode}
            </Text>
          </View>
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
  content: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: SPACING.xl + 8,
    marginBottom: SPACING.lg,
  },
  headerLabel: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },

  block: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  blockLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  currencySelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  flagWrap: {
    width: 48,
    height: 34,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorCode: { color: COLORS.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  selectorName: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chevron: { color: COLORS.accent, fontSize: 20, fontWeight: '700' },

  amountInput: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  rateHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 8, letterSpacing: 0.3 },

  resultBox: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.accent + '25',
  },
  resultValue: {
    color: COLORS.accent,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  resultCode: { color: COLORS.accent, fontSize: 16, fontWeight: '700', opacity: 0.6 },

  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 2,
  },
  swapIcon: { color: COLORS.accent, fontSize: 22, marginRight: 6 },
  swapText: { color: COLORS.accent, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },

  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: SPACING.md,
    marginBottom: 10,
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  quickBtn: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },

  crossBlock: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  crossRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  crossRate: { color: COLORS.textSecondary, fontSize: 14, letterSpacing: 0.2 },

  // Picker
  pickerOverlay: { flex: 1, justifyContent: 'flex-end' },
  pickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  pickerSheet: {
    backgroundColor: COLORS.bgCardAlt,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    maxHeight: '80%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  pickerSearch: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerSearchInput: { color: COLORS.text, padding: 12, fontSize: 15 },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemSelected: { opacity: 0.4 },
  pickerFlagWrap: {
    width: 44,
    height: 30,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerCode: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  pickerName: { color: COLORS.textMuted, fontSize: 12 },
  pickerCheck: { color: COLORS.accent, fontSize: 18 },
});
