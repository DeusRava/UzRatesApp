# 🇺🇿 UzRates — Курсы валют Узбекистана

Мобильное приложение на React Native с официальными курсами ЦБ Узбекистана.

## ✨ Функции
- 💱 Курсы всех валют ЦБ РУз
- 🔄 Конвертер с поиском валют
- 📦 Кэш на 24 часа — работает без интернета
- 🌙 Тёмная тема
- ⚡ Без хостинга

---

## 🚀 Сборка APK (пошагово)

### Шаг 1 — Установи инструменты

1. **Node.js** → https://nodejs.org (версия 18+)
2. **Java JDK 17** → https://adoptium.net
3. **Android Studio** → https://developer.android.com/studio
   - При установке отметь: Android SDK, Android SDK Platform, Android Virtual Device

### Шаг 2 — Настрой переменные окружения

**Windows** (добавить в System Environment Variables):
```
ANDROID_HOME = C:\Users\<ИМЯ>\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\tools
Path += %ANDROID_HOME%\platform-tools
```

**macOS/Linux** (добавить в ~/.bashrc или ~/.zshrc):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Шаг 3 — Подготовь проект

```bash
# Перейди в папку проекта
cd UzRatesApp

# Установи зависимости
npm install

# Инициализируй Android-проект (только один раз)
npx react-native init UzRatesApp --skip-install
# Скопируй папку android/ из созданного проекта сюда
```

### Шаг 4 — Запусти на эмуляторе (для проверки)

```bash
# Открой Android Studio → AVD Manager → запусти эмулятор
npx react-native run-android
```

### Шаг 5 — Собери APK

```bash
cd android
./gradlew assembleRelease   # macOS/Linux
gradlew.bat assembleRelease  # Windows
```

APK будет в:
```
android/app/build/outputs/apk/release/app-release.apk
```

Перекинь на телефон и установи! 📱

---

## 📁 Структура проекта

```
UzRatesApp/
├── App.tsx                        # Точка входа + навигация
├── src/
│   ├── screens/
│   │   ├── RatesScreen.tsx        # Экран курсов
│   │   ├── ConverterScreen.tsx    # Конвертер валют
│   │   └── SettingsScreen.tsx     # Настройки и инфо
│   └── utils/
│       ├── api.ts                 # API ЦБ РУз + кэш
│       └── theme.ts               # Цвета и стили
├── package.json
└── README.md
```

## 📡 API

Данные с официального бесплатного API ЦБ Узбекистана:
```
GET https://cbu.uz/ru/arkhiv-kursov-valyut/json/
```
Обновляется Пн–Пт около 17:30 по Ташкентскому времени.
Кэш хранится локально 24 часа через AsyncStorage.

## 🔧 Зависимости

| Библиотека | Назначение |
|------------|-----------|
| react-native | Основной фреймворк |
| @react-navigation | Навигация между экранами |
| @react-native-async-storage | Локальный кэш курсов |
| react-native-vector-icons | Иконки |
| react-native-linear-gradient | Градиенты |
