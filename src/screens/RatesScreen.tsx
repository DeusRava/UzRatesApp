import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar, TextInput, Image,
} from 'react-native';
import { fetchRates, Rate, getFlagUrl, MAIN_CURRENCIES, getCacheAge } from '../utils/api';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

function RateCard({ item, onPress }: { item: Rate; onPress: (r: Rate) => void }) {
  const flagUrl = getFlagUrl(item.code);
  const isUp = item.diff > 0;
  const isDown = item.diff < 0;
  const diffColor = isUp ? COLORS.green : isDown ? COLORS.red : COLORS.textMuted;
  const diffSign = isUp ? '+' : '';
  const nominal = item.nominal > 1 ? `${item.nominal} ` : '';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        {flagUrl ? (
          <Image source={{ uri: flagUrl }} style={styles.cardFlag} resizeMode="cover" />
        ) : (
          <View style={[styles.cardFlag, styles.cardFlagFallback]}><Text style={styles.cardFlagText}>{item.code.slice(0,2)}</Text></View>
        )}
        <View>
          <Text style={styles.cardCode}>{nominal}{item.code}</Text>
          <Text style={styles.cardName} numberOfLines={1}>{item.nameRu}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardRate}>{item.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</Text>
        <Text style={[styles.cardDiff, { color: diffColor }]}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {diffSign}{Math.abs(item.diff).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function DetailModal({ rate, onClose }: { rate: Rate; onClose: () => void }) {
  const flagUrl = getFlagUrl(rate.code);
  const isUp = rate.diff > 0;
  const isDown = rate.diff < 0;
  const diffColor = isUp ? COLORS.green : isDown ? COLORS.red : COLORS.textMuted;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalCard}>
        {flagUrl ? (
          <Image source={{ uri: flagUrl }} style={styles.modalFlag} resizeMode="cover" />
        ) : (
          <View style={[styles.modalFlag, styles.modalFlagFallback]}><Text style={{color:'#94A3B8',fontSize:20,fontWeight:'700'}}>{rate.code.slice(0,2)}</Text></View>
        )}
        <Text style={styles.modalCode}>{rate.code}</Text>
        <Text style={styles.modalName}>{rate.nameRu}</Text>
        <View style={styles.modalDivider} />
        <View style={styles.modalRow}>
          <Text style={styles.modalLabel}>Курс</Text>
          <Text style={styles.modalValue}>{rate.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} сум</Text>
        </View>
        {rate.nominal > 1 && (
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>За единиц</Text>
            <Text style={styles.modalValue}>{rate.nominal}</Text>
          </View>
        )}
        <View style={styles.modalRow}>
          <Text style={styles.modalLabel}>Изменение</Text>
          <Text style={[styles.modalValue, { color: diffColor }]}>
            {isUp ? '+' : ''}{rate.diff.toFixed(2)} сум
          </Text>
        </View>
        <View style={styles.modalRow}>
          <Text style={styles.modalLabel}>Дата</Text>
          <Text style={styles.modalValue}>{rate.date}</Text>
        </View>
        <TouchableOpacity style={styles.modalClose} onPress={onClose}>
          <Text style={styles.modalCloseText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RatesScreen() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [filtered, setFiltered] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Rate | null>(null);
  const [cacheAge, setCacheAge] = useState<string>('');
  const [error, setError] = useState('');

  const load = useCallback(async (force = false) => {
    try {
      setError('');
      const data = await fetchRates(force);
      setRates(data);
      const age = await getCacheAge();
      if (age !== null) {
        const mins = Math.floor(age / 60000);
        const hrs = Math.floor(mins / 60);
        setCacheAge(hrs > 0 ? `обновлено ${hrs}ч назад` : mins > 0 ? `обновлено ${mins}мин назад` : 'только что обновлено');
      }
    } catch (e) {
      setError('Нет соединения. Показаны кэшированные данные.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = showAll ? rates : rates.filter(r => MAIN_CURRENCIES.includes(r.code));
    if (search.trim()) {
      const q = search.toUpperCase();
      list = rates.filter(r => r.code.includes(q) || r.nameRu.toUpperCase().includes(q));
    }
    setFiltered(list);
  }, [rates, search, showAll]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Загрузка курсов...</Text>
      </View>
    );
  }

  const date = rates[0]?.date || '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🇺🇿 Курсы валют</Text>
          <Text style={styles.headerSub}>ЦБ Узбекистана · {date}</Text>
        </View>
        <View style={styles.cacheBadge}>
          <Text style={styles.cacheText}>{cacheAge}</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск валюты..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="characters"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toggle */}
      {!search && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !showAll && styles.toggleActive]}
            onPress={() => setShowAll(false)}
          >
            <Text style={[styles.toggleText, !showAll && styles.toggleTextActive]}>Основные</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, showAll && styles.toggleActive]}
            onPress={() => setShowAll(true)}
          >
            <Text style={[styles.toggleText, showAll && styles.toggleTextActive]}>Все ({rates.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subtitle */}
      <Text style={styles.subtitle}>1 валюта = X сум</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.code}
        renderItem={({ item }) => <RateCard item={item} onPress={setSelected} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {selected && <DetailModal rate={selected} onClose={() => setSelected(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 14 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
  },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  cacheBadge: {
    backgroundColor: COLORS.accentSoft, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  cacheText: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },

  errorBanner: {
    backgroundColor: COLORS.redSoft, color: COLORS.red,
    paddingHorizontal: SPACING.md, paddingVertical: 8, fontSize: 13,
  },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 6 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 10 },
  clearBtn: { color: COLORS.textMuted, fontSize: 16, padding: 4 },

  toggleRow: {
    flexDirection: 'row', marginHorizontal: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: 3, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.sm - 2 },
  toggleActive: { backgroundColor: COLORS.accent },
  toggleText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  toggleTextActive: { color: COLORS.white },

  subtitle: {
    color: COLORS.textMuted, fontSize: 11, marginHorizontal: SPACING.md,
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },

  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.bgCard, marginHorizontal: SPACING.md,
    marginBottom: 8, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardFlag: { width: 36, height: 24, marginRight: 12, borderRadius: 4 },
  cardFlagFallback: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  cardFlagText: { color: '#94A3B8', fontSize: 9, fontWeight: '700' },
  cardCode: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  cardName: { color: COLORS.textMuted, fontSize: 12, marginTop: 1, maxWidth: 160 },
  cardRight: { alignItems: 'flex-end' },
  cardRate: { color: COLORS.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.3, fontVariant: ['tabular-nums'] },
  cardDiff: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalCard: {
    backgroundColor: COLORS.bgCardAlt, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: SPACING.xl, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  modalFlag: { width: 72, height: 48, marginBottom: 12, borderRadius: 8 },
  modalFlagFallback: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  modalCode: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  modalName: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4, marginBottom: 16 },
  modalDivider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  modalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalLabel: { color: COLORS.textMuted, fontSize: 15 },
  modalValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  modalClose: {
    marginTop: 20, backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    paddingHorizontal: 48, paddingVertical: 14,
  },
  modalCloseText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
