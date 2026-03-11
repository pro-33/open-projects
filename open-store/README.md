# Open Store 🚀

**Магазин Open-Source Приложений** — платформа для скачивания open-source программ с GitHub.

## 🌟 Особенности

- **Каталог приложений** — красивые карточки с иконками и рейтингами
- **Поиск и фильтры** — по категории, рейтингу, цене
- **Система аккаунтов** — вход с разными правами доступа
- **Админ-панель** — управление файлами сайта (для пользователя `misha`)
- **Интеграция с GitHub** — загрузка данных из репозиториев
- **Красивый интерфейс** — современный дизайн в тёмной теме

## 🚀 Развёртывание на GitHub Pages

1. Создайте новый репозиторий на GitHub
2. Загрузите файлы проекта:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `apps-data.json`

3. Включите GitHub Pages:
   - Перейдите в **Settings** → **Pages**
   - Выберите ветку `main` и папку `/ (root)`
   - Нажмите **Save**

4. Ваш сайт будет доступен по адресу:
   ```
   https://<ваш-username>.github.io/<репозиторий>/
   ```

## 👤 Аккаунты

### Администратор
- **Имя:** `misha`
- **Пароль:** `mien0203`
- **Права:** доступ к файлам сайта, редактирование

### Обычный пользователь
- Любой логин/пароль
- **Права:** просмотр, скачивание, избранное

## 📁 Структура проекта

```
open-store/
├── index.html          # Главная страница
├── styles.css          # Стили
├── app.js              # Логика приложения
├── apps-data.json      # Данные приложений
└── README.md           # Документация
```

## 🔧 Добавление приложений

Отредактируйте файл `apps-data.json`, добавив новое приложение:

```json
{
    "id": 7,
    "name": "Название",
    "developer": "Разработчик",
    "description": "Краткое описание",
    "category": "development|multimedia|productivity|utilities|security|education",
    "rating": 4.5,
    "reviews": 1000,
    "price": "free",
    "downloads": 100000,
    "version": "1.0.0",
    "size": "50 MB",
    "icon": "fas fa-icon",
    "longDescription": "Полное описание",
    "githubRepo": "username/repo",
    "releaseDate": "2024-01-01"
}
```

## 🎨 Категории

- **Продуктивность** — productivity
- **Разработка** — development
- **Мультимедиа** — multimedia
- **Утилиты** — utilities
- **Безопасность** — security
- **Образование** — education

## 🛠 Технологии

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Font Awesome (иконки)
- Google Fonts (Inter)

## 📝 Лицензия

MIT License — свободно используйте и модифицируйте!

---

**Open Store** © 2026 | Powered by GitHub Pages
