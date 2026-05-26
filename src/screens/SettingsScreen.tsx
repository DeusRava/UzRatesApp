import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { fetchRates, getCacheAge } from '../utils/api';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

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
      Alert.alert('✅ Готово', 'Курсы валют обновлены');
    } catch (_) {
      Alert.alert('❌ Ошибка', 'Не удалось загрузить данные. Проверьте интернет-соединение.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>⚙️ О приложении</Text>

      {/* Cache info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>КЭШИРОВАНИЕ</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Дата курсов</Text>
            <Text style={styles.rowValue}>{lastDate || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Возраст кэша</Text>
            <Text style={styles.rowValue}>{cacheInfo || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Валют загружено</Text>
            <Text style={styles.rowValue}>{ratesCount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Авто-обновление</Text>
            <Text style={styles.rowValue}>Каждые 24 часа</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={forceRefresh} disabled={refreshing}>
          {refreshing
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.refreshText}>🔄 Обновить сейчас</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Source */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ИСТОЧНИК ДАННЫХ</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Организация</Text>
            <Text style={styles.rowValue}>ЦБ Узбекистана</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Сайт</Text>
            <Text style={[styles.rowValue, { color: COLORS.accent }]}>cbu.uz</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>API</Text>
            <Text style={[styles.rowValue, { color: COLORS.textMuted, fontSize: 11 }]}>cbu.uz/json</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Обновление</Text>
            <Text style={styles.rowValue}>Пн–Пт ~17:30 ТШТ</Text>
          </View>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ПРИЛОЖЕНИЕ</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Версия</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Платформа</Text>
            <Text style={styles.rowValue}>React Native</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Хостинг</Text>
            <Text style={[styles.rowValue, { color: COLORS.green }]}>Не требуется ✓</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🇺🇿 Курсы валют Узбекистана</Text>
        <Text style={styles.footerSub}>Официальные данные ЦБ РУз</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md, paddingBottom: 100 },

  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: SPACING.lg, marginBottom: SPACING.lg },

  section: { marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },

  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 14,
  },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14 },
  rowValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },

  refreshBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    paddingVertical: 14, alignItems: 'center', marginTop: 10,
  },
  refreshText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  footer: { alignItems: 'center', paddingVertical: SPACING.xl },
  footerText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  footerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
});
