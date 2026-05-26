import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { fetchRates, Rate, MAIN_CURRENCIES, getCacheAge } from '../utils/api';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import FlagImage from './FlagImage';

function RateCard({ item, onPress }: { item: Rate; onPress: (r: Rate) => void }) {
  const isUp = item.diff > 0;
  const isDown = item.diff < 0;
  const diffColor = isUp ? COLORS.green : isDown ? COLORS.red : COLORS.textMuted;
  const nominal = item.nominal > 1 ? `${item.nominal} ` : '';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.75}>
      {/* Left: currency badge + name */}
      <View style={styles.cardLeft}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeBadgeText}>{item.code}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardCode}>{nominal}{item.code}</Text>
          <Text style={styles.cardName} numberOfLines={1}>{item.nameRu}</Text>
        </View>
      </View>

      {/* Right: rate + diff */}
      <View style={styles.cardRight}>
        <Text style={styles.cardRate}>
          {item.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
        </Text>
        <View style={[styles.diffBadge, { backgroundColor: isUp ? COLORS.greenSoft : isDown ? COLORS.redSoft : 'transparent' }]}>
          <Text style={[styles.cardDiff, { color: diffColor }]}>
            {isUp ? '↑' : isDown ? '↓' : '·'} {Math.abs(item.diff).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DetailModal({ rate, onClose }: { rate: Rate; onClose: () => void }) {
  const isUp = rate.diff > 0;
  const isDown = rate.diff < 0;
  const diffColor = isUp ? COLORS.green : isDown ? COLORS.red : COLORS.textMuted;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalCard}>
        {/* Glow orb */}
        <View style={styles.modalGlow} />

        <View style={styles.modalFlagWrap}>
          <FlagImage currencyCode={rate.code} size={56} />
        </View>
        <Text style={styles.modalCode}>{rate.code}</Text>
        <Text style={styles.modalName}>{rate.nameRu}</Text>

        <View style={styles.modalDivider} />

        <View style={styles.modalRow}>
          <Text style={styles.modalLabel}>Курс к суму</Text>
          <Text style={styles.modalValue}>
            {rate.rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </Text>
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
        setCacheAge(hrs > 0 ? `${hrs}ч назад` : mins > 0 ? `${mins}м назад` : 'сейчас');
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
          <Text style={styles.headerLabel}>ЦБ УЗБЕКИСТАНА</Text>
          <Text style={styles.headerTitle}>Курсы валют</Text>
          <Text style={styles.headerDate}>{date}</Text>
        </View>
        {cacheAge ? (
          <View style={styles.cacheBadge}>
            <View style={styles.cacheDot} />
            <Text style={styles.cacheText}>{cacheAge}</Text>
          </View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
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
            <Text style={[styles.toggleText, showAll && styles.toggleTextActive]}>Все валюты · {rates.length}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.code}
        renderItem={({ item }) => <RateCard item={item} onPress={setSelected} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 100, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {selected && <DetailModal rate={selected} onClose={() => setSelected(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 14, letterSpacing: 0.3 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl + 8,
    paddingBottom: SPACING.md,
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
  headerDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  cacheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  cacheDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },
  cacheText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },

  errorBanner: {
    backgroundColor: COLORS.redSoft,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.red + '30',
  },
  errorText: { color: COLORS.red, fontSize: 13 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
  },
  searchIcon: { color: COLORS.textMuted, fontSize: 20, marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15, letterSpacing: 0.5 },
  clearBtn: { color: COLORS.textMuted, fontSize: 14, padding: 4 },

  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  toggleActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  toggleTextActive: { color: COLORS.white, fontWeight: '700' },

  // Card
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  flagWrap: {
    width: 48,
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardInfo: { flex: 1 },
  cardCode: { color: COLORS.text, fontWeight: '700', fontSize: 16, letterSpacing: -0.3 },
  cardName: { color: COLORS.textMuted, fontSize: 12, marginTop: 2, letterSpacing: 0.2 },
  cardRight: { alignItems: 'flex-end' },
  cardRate: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  diffBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  cardDiff: { fontSize: 12, fontWeight: '600' },

  // Modal
  modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  modalCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accentPurple,
    opacity: 0.12,
  },
  modalFlagWrap: {
    width: 80,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCode: { color: COLORS.text, fontSize: 32, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  modalName: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4, marginBottom: 20, letterSpacing: 0.3 },
  modalDivider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalLabel: { color: COLORS.textMuted, fontSize: 14, letterSpacing: 0.3 },
  modalValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  modalClose: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 56,
    paddingVertical: 15,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  modalCloseText: { color: COLORS.white, fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
});
