import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { fetchRates, getCacheAge } from '../utils/api';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: COLORS.accent }]}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const [cacheInfo, setCacheInfo] = useState<string>('');
  const [ratesCount, setRatesCount] = useState(0);
  const [lastDate, setLastDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadInfo = async () => {
    try {
      const data = await fetchRates();
      setRatesCount(data.length);
      setLastDate(data[0]?.date || '');
      const age = await getCacheAge();
      if (age !== null) {
        const mins = Math.floor(age / 60000);
        const hrs = Math.floor(mins / 60);
        setCacheInfo(hrs > 0 ? `${hrs} ч. ${mins % 60} мин.` : `${mins} мин.`);
      }
    } catch (_) {}
  };

  useEffect(() => { loadInfo(); }, []);

  const forceRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRates(true);
      await loadInfo();
      Alert.alert('Готово', 'Курсы валют обновлены');
    } catch (_) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные. Проверьте интернет-соединение.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>О ПРИЛОЖЕНИИ</Text>
        <Text style={styles.headerTitle}>Информация</Text>
      </View>

      {/* App card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <View style={styles.heroIconWrap}>
          <Text style={styles.heroIcon}>₿</Text>
        </View>
        <Text style={styles.heroTitle}>UzRates</Text>
        <Text style={styles.heroSub}>Курсы валют ЦБ Узбекистана</Text>
        <View style={styles.heroBadge}>
          <View style={styles.heroDot} />
          <Text style={styles.heroBadgeText}>Официальный источник · cbu.uz</Text>
        </View>
      </View>

      {/* Cache section */}
      <Text style={styles.sectionTitle}>КЭШИРОВАНИЕ</Text>
      <View style={styles.card}>
        <InfoRow label="Дата курсов" value={lastDate || '—'} />
        <View style={styles.divider} />
        <InfoRow label="Возраст кэша" value={cacheInfo || '—'} />
        <View style={styles.divider} />
        <InfoRow label="Загружено валют" value={ratesCount ? `${ratesCount} шт.` : '—'} />
        <View style={styles.divider} />
        <InfoRow label="Авто-обновление" value="Каждые 24 часа" accent />
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={forceRefresh} disabled={refreshing}>
        {refreshing
          ? <ActivityIndicator color={COLORS.white} />
          : <Text style={styles.refreshText}>Обновить курсы сейчас</Text>
        }
      </TouchableOpacity>

      {/* Source section */}
      <Text style={styles.sectionTitle}>ИСТОЧНИК ДАННЫХ</Text>
      <View style={styles.card}>
        <InfoRow label="Организация" value="ЦБ Узбекистана" />
        <View style={styles.divider} />
        <InfoRow label="Сайт" value="cbu.uz" accent />
        <View style={styles.divider} />
        <InfoRow label="Обновление ЦБ" value="Пн–Пт ~17:30 ТШТ" />
        <View style={styles.divider} />
        <InfoRow label="Доступ к API" value="Бесплатный · Открытый" accent />
      </View>

      {/* App info */}
      <Text style={styles.sectionTitle}>ПРИЛОЖЕНИЕ</Text>
      <View style={styles.card}>
        <InfoRow label="Версия" value="1.0.0" />
        <View style={styles.divider} />
        <InfoRow label="Платформа" value="React Native 0.73" />
        <View style={styles.divider} />
        <InfoRow label="Интернет не нужен" value="Есть кэш ✓" accent />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Сделано с ♥ для Узбекистана</Text>
        <Text style={styles.footerSub}>Данные носят информационный характер</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 100 },

  headerRow: {
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

  // Hero card
  heroCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accentPurple,
    opacity: 0.15,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroIcon: { fontSize: 28, color: COLORS.accent },
  heroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  heroSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },
  heroBadgeText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },

  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 15,
  },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14, letterSpacing: 0.2 },
  rowValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },

  refreshBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  refreshText: { color: COLORS.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

  footer: { alignItems: 'center', paddingVertical: SPACING.xl },
  footerText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  footerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, letterSpacing: 0.3 },
});
