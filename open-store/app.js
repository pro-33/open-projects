// Open Store - Исправленная версия
console.log('Open Store: Загрузка приложения...');

const CATEGORIES = {
    productivity: { name: 'Продуктивность', icon: 'fas fa-briefcase', color: '#6366f1' },
    development: { name: 'Разработка', icon: 'fas fa-code', color: '#10b981' },
    multimedia: { name: 'Мультимедиа', icon: 'fas fa-film', color: '#f59e0b' },
    utilities: { name: 'Утилиты', icon: 'fas fa-tools', color: '#3b82f6' },
    security: { name: 'Безопасность', icon: 'fas fa-shield-alt', color: '#ef4444' },
    education: { name: 'Образование', icon: 'fas fa-graduation-cap', color: '#8b5cf6' },
    network: { name: 'Сеть', icon: 'fas fa-globe', color: '#06b6d4' },
    games: { name: 'Игры', icon: 'fas fa-gamepad', color: '#ec4899' }
};

const state = {
    apps: [],
    filteredApps: [],
    currentUser: null,
    users: [],
    favorites: [],
    userApps: [],
    siteMessages: [],
    filters: { search: '', category: 'all', rating: 'all', price: 'all', platform: 'all', sort: 'popular' }
};

let elements = {};

// Демо приложения (48 штук)
function getDemoApps() {
    return [
        { id: 1, name: "Visual Studio Code", developer: "Microsoft", description: "Редактор кода с расширениями", category: "development", rating: 4.8, reviews: 15420, price: "free", downloads: 5000000, version: "1.85.0", size: "95 MB", icon: "fas fa-code", iconUrl: "https://github.com/microsoft.png?size=100", longDescription: "Мощный редактор кода", githubRepo: "microsoft/vscode", releaseDate: "2024-01-15", isLinux: true, hasReleases: true, stars: 150000 },
        { id: 2, name: "VSCodium", developer: "VSCodium Team", description: "VS Code без телеметрии", category: "development", rating: 4.7, reviews: 8500, price: "free", downloads: 1200000, version: "1.85.0", size: "90 MB", icon: "fas fa-code", iconUrl: "https://github.com/vscodium.png?size=100", longDescription: "VS Code без телеметрии", githubRepo: "VSCodium/vscodium", releaseDate: "2024-01-14", isLinux: true, hasReleases: true },
        { id: 3, name: "OBS Studio", developer: "OBS Project", description: "Запись и стриминг видео", category: "multimedia", rating: 4.7, reviews: 8930, price: "free", downloads: 3000000, version: "30.0.2", size: "112 MB", icon: "fas fa-video", iconUrl: "https://github.com/obsproject.png?size=100", longDescription: "Профессиональное ПО для стриминга", githubRepo: "obsproject/obs-studio", releaseDate: "2024-01-10", isLinux: true, hasReleases: true },
        { id: 4, name: "Blender", developer: "Blender Foundation", description: "3D моделирование и анимация", category: "multimedia", rating: 4.8, reviews: 14000, price: "free", downloads: 4000000, version: "4.0.2", size: "350 MB", icon: "fas fa-cube", iconUrl: "https://github.com/blender.png?size=100", longDescription: "Профессиональный 3D пакет", githubRepo: "blender/blender", releaseDate: "2024-01-11", isLinux: true, hasReleases: true },
        { id: 5, name: "GIMP", developer: "GIMP Team", description: "Редактор изображений", category: "multimedia", rating: 4.4, reviews: 16000, price: "free", downloads: 7000000, version: "3.0 RC1", size: "300 MB", icon: "fas fa-paint-brush", iconUrl: "https://github.com/GNOME.png?size=100", longDescription: "Профессиональное редактирование изображений", githubRepo: "GNOME/gimp", releaseDate: "2024-01-04", isLinux: true, hasReleases: true },
        { id: 6, name: "Krita", developer: "Krita Foundation", description: "Цифровая живопись", category: "multimedia", rating: 4.6, reviews: 9200, price: "free", downloads: 2800000, version: "5.2.1", size: "280 MB", icon: "fas fa-palette", iconUrl: "https://github.com/KDE.png?size=100", longDescription: "Инструмент для цифровых художников", githubRepo: "KDE/krita", releaseDate: "2024-01-09", isLinux: true, hasReleases: true },
        { id: 7, name: "Proton", developer: "Valve", description: "Запуск Windows игр на Linux", category: "games", rating: 4.7, reviews: 22000, price: "free", downloads: 8000000, version: "8.0", size: "500 MB", icon: "fab fa-steam", iconUrl: "https://github.com/ValveSoftware.png?size=100", longDescription: "Совместимость Steam Play для Linux", githubRepo: "ValveSoftware/Proton", releaseDate: "2024-01-12", isLinux: true, hasReleases: true },
        { id: 8, name: "Lutris", developer: "Lutris Team", description: "Игровая платформа для Linux", category: "games", rating: 4.5, reviews: 11500, price: "free", downloads: 2500000, version: "0.5.14", size: "45 MB", icon: "fas fa-gamepad", iconUrl: "https://github.com/lutris.png?size=100", longDescription: "Установка и запуск игр на Linux", githubRepo: "lutris/lutris", releaseDate: "2024-01-08", isLinux: true, hasReleases: true },
        { id: 9, name: "Heroic Launcher", developer: "Heroic Team", description: "Launcher для Epic Games и GOG", category: "games", rating: 4.6, reviews: 8900, price: "free", downloads: 1800000, version: "2.12.0", size: "120 MB", icon: "fas fa-rocket", iconUrl: "https://github.com/heroicgameslauncher.png?size=100", longDescription: "Альтернативный launcher для Linux", githubRepo: "heroicgameslauncher/heroic", releaseDate: "2024-01-11", isLinux: true, hasReleases: true },
        { id: 10, name: "Dolphin", developer: "Dolphin Team", description: "Эмулятор GameCube и Wii", category: "games", rating: 4.8, reviews: 19000, price: "free", downloads: 5500000, version: "2312", size: "85 MB", icon: "fas fa-fish", iconUrl: "https://github.com/dolphin-emu.png?size=100", longDescription: "Лучший эмулятор GameCube/Wii", githubRepo: "dolphin-emu/dolphin", releaseDate: "2024-01-13", isLinux: true, hasReleases: true },
        { id: 11, name: "RPCS3", developer: "RPCS3 Team", description: "Эмулятор PlayStation 3", category: "games", rating: 4.5, reviews: 12500, price: "free", downloads: 3200000, version: "0.0.30", size: "95 MB", icon: "fab fa-playstation", iconUrl: "https://github.com/RPCS3.png?size=100", longDescription: "Эмуляция PS3 на ПК", githubRepo: "RPCS3/rpcs3", releaseDate: "2024-01-10", isLinux: true, hasReleases: true },
        { id: 12, name: "PPSSPP", developer: "PPSSPP Team", description: "Эмулятор PSP", category: "games", rating: 4.7, reviews: 25000, price: "free", downloads: 12000000, version: "1.16.0", size: "35 MB", icon: "fas fa-gamepad", iconUrl: "https://github.com/ppsspp.png?size=100", longDescription: "Портативный эмулятор PSP", githubRepo: "ppsspp/ppsspp", releaseDate: "2024-01-09", isLinux: true, hasReleases: true },
        { id: 13, name: "Cemu", developer: "Cemu Team", description: "Эмулятор Wii U", category: "games", rating: 4.6, reviews: 9800, price: "free", downloads: 2800000, version: "2.0", size: "25 MB", icon: "fas fa-gamepad", iconUrl: "https://github.com/cemu-project.png?size=100", longDescription: "Эмулятор Nintendo Wii U", githubRepo: "cemu-project/Cemu", releaseDate: "2024-01-08", isLinux: true, hasReleases: true },
        { id: 14, name: "xemu", developer: "xemu Team", description: "Эмулятор Xbox", category: "games", rating: 4.4, reviews: 7500, price: "free", downloads: 1500000, version: "0.7.100", size: "45 MB", icon: "fab fa-xbox", iconUrl: "https://github.com/xemu-project.png?size=100", longDescription: "Эмулятор оригинальной Xbox", githubRepo: "xemu-project/xemu", releaseDate: "2024-01-07", isLinux: true, hasReleases: true },
        { id: 15, name: "RetroArch", developer: "Libretro", description: "Универсальный эмулятор", category: "games", rating: 4.4, reviews: 18000, price: "free", downloads: 8500000, version: "1.18.0", size: "150 MB", icon: "fas fa-gamepad", iconUrl: "https://github.com/libretro.png?size=100", longDescription: "Все ретро-консоли в одном", githubRepo: "libretro/RetroArch", releaseDate: "2024-01-07", isLinux: true, hasReleases: true },
        { id: 16, name: "0 A.D.", developer: "Wildfire Games", description: "Стратегия в реальном времени", category: "games", rating: 4.5, reviews: 9800, price: "free", downloads: 2200000, version: "Alpha 26", size: "6 GB", icon: "fas fa-chess", iconUrl: "https://github.com/0ad.png?size=100", longDescription: "Историческая RTS игра", githubRepo: "0ad/0ad", releaseDate: "2024-01-05", isLinux: true, hasReleases: true },
        { id: 17, name: "Minetest", developer: "Minetest Team", description: "Воксельная песочница", category: "games", rating: 4.6, reviews: 14500, price: "free", downloads: 4500000, version: "5.8.0", size: "50 MB", icon: "fas fa-cubes", iconUrl: "https://github.com/minetest.png?size=100", longDescription: "Open-source альтернатива Minecraft", githubRepo: "minetest/minetest", releaseDate: "2024-01-06", isLinux: true, hasReleases: true },
        { id: 18, name: "Xonotic", developer: "Xonotic Team", description: "Шутер от первого лица", category: "games", rating: 4.3, reviews: 6500, price: "free", downloads: 1800000, version: "0.8.6", size: "800 MB", icon: "fas fa-crosshairs", iconUrl: "https://github.com/xonotic.png?size=100", longDescription: "Быстрый аркадный шутер", githubRepo: "xonotic/xonotic", releaseDate: "2024-01-04", isLinux: true, hasReleases: true },
        { id: 19, name: "LibreOffice", developer: "Document Foundation", description: "Офисный пакет", category: "productivity", rating: 4.4, reviews: 18500, price: "free", downloads: 12000000, version: "7.6.4", size: "400 MB", icon: "fas fa-file-word", iconUrl: "https://github.com/libreoffice.png?size=100", longDescription: "Альтернатива Microsoft Office", githubRepo: "libreoffice/core", releaseDate: "2024-01-05", isLinux: true, hasReleases: true },
        { id: 20, name: "Joplin", developer: "Laurent Cozic", description: "Приложение для заметок", category: "productivity", rating: 4.5, reviews: 7800, price: "free", downloads: 1500000, version: "2.13.5", size: "200 MB", icon: "fas fa-book", iconUrl: "https://github.com/laurent22.png?size=100", longDescription: "Заметки с синхронизацией", githubRepo: "laurent22/joplin", releaseDate: "2024-01-06", isLinux: true, hasReleases: true },
        { id: 21, name: "Thunderbird", developer: "Mozilla", description: "Почтовый клиент", category: "productivity", rating: 4.3, reviews: 15200, price: "free", downloads: 9000000, version: "115.6.0", size: "180 MB", icon: "fas fa-envelope", iconUrl: "https://github.com/thunderbird.png?size=100", longDescription: "Мощный почтовый клиент", githubRepo: "thunderbird/thunderbird", releaseDate: "2024-01-12", isLinux: true, hasReleases: true },
        { id: 22, name: "Telegram", developer: "Telegram Team", description: "Мессенджер", category: "productivity", rating: 4.6, reviews: 28000, price: "free", downloads: 15000000, version: "4.14.0", size: "65 MB", icon: "fab fa-telegram", iconUrl: "https://github.com/telegramdesktop.png?size=100", longDescription: "Быстрый и безопасный мессенджер", githubRepo: "telegramdesktop/tdesktop", releaseDate: "2024-01-14", isLinux: true, hasReleases: true },
        { id: 23, name: "KeePassXC", developer: "KeePassXC Team", description: "Менеджер паролей", category: "security", rating: 4.4, reviews: 3200, price: "free", downloads: 500000, version: "2.7.6", size: "25 MB", icon: "fas fa-key", iconUrl: "https://github.com/keepassxreboot.png?size=100", longDescription: "Безопасное хранение паролей", githubRepo: "keepassxreboot/keepassxc", releaseDate: "2024-01-05", isLinux: true, hasReleases: true },
        { id: 24, name: "FileZilla", developer: "FileZilla Team", description: "FTP клиент", category: "network", rating: 4.3, reviews: 9500, price: "free", downloads: 5500000, version: "3.66.1", size: "30 MB", icon: "fas fa-network-wired", iconUrl: "https://github.com/filezilla.png?size=100", longDescription: "Быстрый FTP клиент", githubRepo: "filezilla/filezilla", releaseDate: "2024-01-02", isLinux: true, hasReleases: true },
        { id: 25, name: "qBittorrent", developer: "qBittorrent Team", description: "Torrent клиент", category: "network", rating: 4.7, reviews: 18500, price: "free", downloads: 8500000, version: "4.6.2", size: "55 MB", icon: "fas fa-magnet", iconUrl: "https://github.com/qbittorrent.png?size=100", longDescription: "Легковесный torrent клиент", githubRepo: "qbittorrent/qBittorrent", releaseDate: "2024-01-11", isLinux: true, hasReleases: true },
        { id: 26, name: "Syncthing", developer: "Syncthing Team", description: "Синхронизация файлов", category: "utilities", rating: 4.6, reviews: 11200, price: "free", downloads: 3800000, version: "1.25.0", size: "25 MB", icon: "fas fa-sync", iconUrl: "https://github.com/syncthing.png?size=100", longDescription: "Децентрализованная синхронизация", githubRepo: "syncthing/syncthing", releaseDate: "2024-01-10", isLinux: true, hasReleases: true },
        { id: 27, name: "Wireshark", developer: "Wireshark Foundation", description: "Анализатор трафика", category: "security", rating: 4.6, reviews: 8200, price: "free", downloads: 4200000, version: "4.2.0", size: "75 MB", icon: "fas fa-wifi", iconUrl: "https://github.com/wireshark.png?size=100", longDescription: "Профессиональный сниффер", githubRepo: "wireshark/wireshark", releaseDate: "2024-01-08", isLinux: true, hasReleases: true },
        { id: 28, name: "Nmap", developer: "Nmap Project", description: "Сканер сетей", category: "security", rating: 4.7, reviews: 6800, price: "free", downloads: 3800000, version: "7.94", size: "40 MB", icon: "fas fa-user-secret", iconUrl: "https://github.com/nmap.png?size=100", longDescription: "Аудит безопасности", githubRepo: "nmap/nmap", releaseDate: "2024-01-06", isLinux: true, hasReleases: true },
        { id: 29, name: "Kali Linux", developer: "Offensive Security", description: "Дистрибутив для пентестинга", category: "security", rating: 4.8, reviews: 15000, price: "free", downloads: 6000000, version: "2024.1", size: "3.5 GB", icon: "fas fa-terminal", iconUrl: "https://github.com/kalilinux.png?size=100", longDescription: "Инструменты для пентестинга", githubRepo: "kalilinux/kali-rolling", releaseDate: "2024-01-15", isLinux: true, hasReleases: true },
        { id: 30, name: "Stellarium", developer: "Stellarium Team", description: "Планетарий", category: "education", rating: 4.7, reviews: 8500, price: "free", downloads: 2500000, version: "23.4", size: "250 MB", icon: "fas fa-star", iconUrl: "https://github.com/stellarium.png?size=100", longDescription: "Виртуальный планетарий", githubRepo: "stellarium/stellarium", releaseDate: "2024-01-09", isLinux: true, hasReleases: true },
        { id: 31, name: "GeoGebra", developer: "GeoGebra Team", description: "Математическое ПО", category: "education", rating: 4.5, reviews: 12000, price: "free", downloads: 5500000, version: "6.0.800", size: "180 MB", icon: "fas fa-calculator", iconUrl: "https://github.com/geogebra.png?size=100", longDescription: "Геометрия и алгебра", githubRepo: "geogebra/geogebra", releaseDate: "2024-01-11", isLinux: true, hasReleases: true },
        { id: 32, name: "Anki", developer: "AnkiWeb", description: "Карточки для запоминания", category: "education", rating: 4.6, reviews: 9500, price: "free", downloads: 2000000, version: "23.12.1", size: "120 MB", icon: "fas fa-brain", iconUrl: "https://github.com/ankitects.png?size=100", longDescription: "Интервальное повторение", githubRepo: "ankitects/anki", releaseDate: "2024-01-09", isLinux: true, hasReleases: true },
        { id: 33, name: "Git", developer: "SF Conservancy", description: "Система контроля версий", category: "development", rating: 4.9, reviews: 18000, price: "free", downloads: 8000000, version: "2.43.0", size: "50 MB", icon: "fab fa-git-alt", iconUrl: "https://github.com/git.png?size=100", longDescription: "Распределенная система контроля версий", githubRepo: "git/git", releaseDate: "2024-01-14", isLinux: true, hasReleases: true },
        { id: 34, name: "Python", developer: "PSF", description: "Язык программирования", category: "development", rating: 4.9, reviews: 35000, price: "free", downloads: 20000000, version: "3.12.1", size: "100 MB", icon: "fab fa-python", iconUrl: "https://github.com/python.png?size=100", longDescription: "Популярный язык программирования", githubRepo: "python/cpython", releaseDate: "2024-01-13", isLinux: true, hasReleases: true },
        { id: 35, name: "Neovim", developer: "Neovim Team", description: "Улучшенный Vim", category: "development", rating: 4.8, reviews: 11500, price: "free", downloads: 1800000, version: "0.9.5", size: "15 MB", icon: "fas fa-terminal", iconUrl: "https://github.com/neovim.png?size=100", longDescription: "Гипертекстовый редактор", githubRepo: "neovim/neovim", releaseDate: "2024-01-10", isLinux: true, hasReleases: true },
        { id: 36, name: "Docker", developer: "Docker Inc", description: "Платформа контейнеризации", category: "development", rating: 4.7, reviews: 22000, price: "free", downloads: 9000000, version: "24.0.7", size: "120 MB", icon: "fab fa-docker", iconUrl: "https://github.com/docker.png?size=100", longDescription: "Контейнеры для приложений", githubRepo: "docker/cli", releaseDate: "2024-01-14", isLinux: true, hasReleases: true },
        { id: 37, name: "Godot Engine", developer: "Godot Team", description: "Игровой движок", category: "development", rating: 4.8, reviews: 16500, price: "free", downloads: 4200000, version: "4.2.1", size: "150 MB", icon: "fas fa-robot", iconUrl: "https://github.com/godotengine.png?size=100", longDescription: "Универсальный игровой движок", githubRepo: "godotengine/godot", releaseDate: "2024-01-12", isLinux: true, hasReleases: true },
        { id: 38, name: "VLC", developer: "VideoLAN", description: "Медиаплеер", category: "multimedia", rating: 4.5, reviews: 25000, price: "free", downloads: 10000000, version: "3.0.20", size: "45 MB", icon: "fas fa-play-circle", iconUrl: "https://github.com/videolan.png?size=100", longDescription: "Универсальный плеер", githubRepo: "videolan/vlc", releaseDate: "2024-01-08", isLinux: true, hasReleases: true },
        { id: 39, name: "HandBrake", developer: "HandBrake Team", description: "Видео конвертер", category: "multimedia", rating: 4.6, reviews: 14200, price: "free", downloads: 6500000, version: "1.7.3", size: "85 MB", icon: "fas fa-film", iconUrl: "https://github.com/HandBrake.png?size=100", longDescription: "Конвертирование видео", githubRepo: "HandBrake/HandBrake", releaseDate: "2024-01-07", isLinux: true, hasReleases: true },
        { id: 40, name: "Audacity", developer: "Audacity Team", description: "Аудиоредактор", category: "multimedia", rating: 4.5, reviews: 11000, price: "free", downloads: 6000000, version: "3.4.2", size: "85 MB", icon: "fas fa-music", iconUrl: "https://github.com/audacity.png?size=100", longDescription: "Редактирование аудио", githubRepo: "audacity/audacity", releaseDate: "2024-01-07", isLinux: true, hasReleases: true },
        { id: 41, name: "Darktable", developer: "Darktable Team", description: "Обработка RAW фото", category: "multimedia", rating: 4.5, reviews: 7800, price: "free", downloads: 2200000, version: "4.6.1", size: "200 MB", icon: "fas fa-camera", iconUrl: "https://github.com/darktable-org.png?size=100", longDescription: "Профессиональная обработка RAW", githubRepo: "darktable-org/darktable", releaseDate: "2024-01-06", isLinux: true, hasReleases: true },
        { id: 42, name: "Citra", developer: "Citra Team", description: "Эмулятор Nintendo 3DS", category: "games", rating: 4.4, reviews: 11000, price: "free", downloads: 4500000, version: "2023.10.1", size: "55 MB", icon: "fas fa-gamepad", iconUrl: "https://github.com/citra-emu.png?size=100", longDescription: "Эмулятор 3DS", githubRepo: "citra-emu/citra", releaseDate: "2024-01-05", isLinux: true, hasReleases: true },
        { id: 43, name: "MAME", developer: "MAME Team", description: "Мультиаркадный эмулятор", category: "games", rating: 4.3, reviews: 8500, price: "free", downloads: 3500000, version: "0.261", size: "85 MB", icon: "fas fa-joystick", iconUrl: "https://github.com/mame.png?size=100", longDescription: "Эмуляция аркадных автоматов", githubRepo: "mame/mame", releaseDate: "2024-01-04", isLinux: true, hasReleases: true },
        { id: 44, name: "Parrot OS", developer: "Parrot Security", description: "Дистрибутив для безопасности", category: "security", rating: 4.6, reviews: 8900, price: "free", downloads: 2800000, version: "6.0", size: "4.2 GB", icon: "fas fa-parachute-box", iconUrl: "https://github.com/parrotsec.png?size=100", longDescription: "Безопасность и приватность", githubRepo: "parrotsec/parrot", releaseDate: "2024-01-13", isLinux: true, hasReleases: true },
        { id: 45, name: "Tails", developer: "Tails Team", description: "Анонимная ОС", category: "security", rating: 4.7, reviews: 12000, price: "free", downloads: 3500000, version: "6.0", size: "1.2 GB", icon: "fas fa-user-ninja", iconUrl: "https://github.com/tails.png?size=100", longDescription: "Полная анонимность", githubRepo: "tails/tails", releaseDate: "2024-01-11", isLinux: true, hasReleases: true },
        { id: 46, name: "Transmission", developer: "Transmission Team", description: "Torrent клиент", category: "network", rating: 4.5, reviews: 12500, price: "free", downloads: 7500000, version: "4.0.5", size: "25 MB", icon: "fas fa-download", iconUrl: "https://github.com/transmission.png?size=100", longDescription: "Простой torrent клиент", githubRepo: "transmission/transmission", releaseDate: "2024-01-09", isLinux: true, hasReleases: true },
        { id: 47, name: "Nginx", developer: "Nginx Inc", description: "Веб-сервер", category: "network", rating: 4.8, reviews: 15000, price: "free", downloads: 12000000, version: "1.25.3", size: "5 MB", icon: "fas fa-server", iconUrl: "https://github.com/nginx.png?size=100", longDescription: "Высокопроизводительный сервер", githubRepo: "nginx/nginx", releaseDate: "2024-01-12", isLinux: true, hasReleases: true },
        { id: 48, name: "GCompris", developer: "GCompris Team", description: "Образовательные игры для детей", category: "education", rating: 4.4, reviews: 5500, price: "free", downloads: 1200000, version: "3.4", size: "350 MB", icon: "fas fa-child", iconUrl: "https://github.com/gcompris.png?size=100", longDescription: "Игры для детей 2-10 лет", githubRepo: "gcompris/gcompris", releaseDate: "2024-01-08", isLinux: true, hasReleases: true }
    ];
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('Open Store: DOM загружен');
    init();
});

async function init() {
    try {
        cacheElements();
        setupEventListeners();
        loadFromStorage();
        await loadApps();
        renderSiteMessages();
        console.log('Open Store: Инициализация завершена');
    } catch (error) {
        console.error('Open Store: Ошибка инициализации:', error);
    }
}

function cacheElements() {
    elements = {
        appsGrid: document.getElementById('appsGrid'),
        loading: document.getElementById('loading'),
        searchInput: document.getElementById('searchInput'),
        categoryFilter: document.getElementById('categoryFilter'),
        priceFilter: document.getElementById('priceFilter'),
        sortSelect: document.getElementById('sortSelect'),
        loginBtn: document.getElementById('loginBtn'),
        loginModal: document.getElementById('loginModal'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        closeModal: document.getElementById('closeModal'),
        appModal: document.getElementById('appModal'),
        closeAppModal: document.getElementById('closeAppModal'),
        appDetail: document.getElementById('appDetail'),
        profileModal: document.getElementById('profileModal'),
        closeProfileModal: document.getElementById('closeProfileModal'),
        editProfileModal: document.getElementById('editProfileModal'),
        closeEditProfileModal: document.getElementById('closeEditProfileModal'),
        editProfileForm: document.getElementById('editProfileForm'),
        addAppModal: document.getElementById('addAppModal'),
        closeAddAppModal: document.getElementById('closeAddAppModal'),
        addAppForm: document.getElementById('addAppForm'),
        addAppBtn: document.getElementById('addAppBtn'),
        adminPanel: document.getElementById('adminPanel'),
        closeAdmin: document.getElementById('closeAdmin'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notificationText'),
        resetFilters: document.getElementById('resetFilters'),
        siteMessages: document.getElementById('siteMessages'),
        editProfileBtn: document.getElementById('editProfileBtn'),
        deleteAccountBtn: document.getElementById('deleteAccountBtn'),
        userAppsList: document.getElementById('userAppsList'),
        favoritesList: document.getElementById('favoritesList'),
        reviewsList: document.getElementById('reviewsList')
    };
    console.log('Open Store: Элементы закэшированы', elements);
}

async function loadApps() {
    console.log('Open Store: Загрузка приложений...');
    showLoading(true);
    
    // Загружаем демо-приложения
    state.apps = getDemoApps();
    state.filteredApps = [...state.apps];
    
    console.log('Open Store: Приложений загружено:', state.apps.length);
    
    renderApps();
    showLoading(false);
}

function renderApps() {
    if (!elements.appsGrid) {
        console.error('appsGrid не найден');
        return;
    }
    
    elements.appsGrid.innerHTML = '';
    
    if (state.filteredApps.length === 0) {
        elements.appsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;"><i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i><p style="color: var(--text-secondary);">Приложения не найдены</p></div>';
        return;
    }
    
    state.filteredApps.forEach(app => {
        const card = createAppCard(app);
        elements.appsGrid.appendChild(card);
    });
    
    console.log('Open Store: Приложения отрендерены');
}

function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    
    const cat = CATEGORIES[app.category] || { name: app.category, color: '#6366f1' };
    const iconHtml = app.iconUrl 
        ? `<img src="${app.iconUrl}" alt="${app.name}" onerror="this.parentElement.innerHTML='<i class=\\'${app.icon}\\'></i>'">`
        : `<i class="${app.icon}"></i>`;
    
    card.innerHTML = `
        <span class="category-tag" style="background: ${cat.color}20; color: ${cat.color}">${cat.name}</span>
        ${app.isLinux ? '<span class="linux-badge"><i class="fab fa-linux"></i> Linux</span>' : ''}
        <div class="app-card-icon" style="background: ${cat.color}20;">${iconHtml}</div>
        <h3>${app.name}</h3>
        <p class="developer">${app.developer}</p>
        <p class="description">${app.description}</p>
        <div class="meta">
            <div class="rating"><i class="fas fa-star"></i><span>${app.rating}</span><span>(${formatNumber(app.reviews)})</span></div>
            <div class="price ${app.price}">${app.price === 'free' ? 'Бесплатно' : `$${app.priceValue}`}</div>
        </div>
    `;
    
    card.addEventListener('click', () => openAppModal(app));
    return card;
}

function openAppModal(app) {
    const cat = CATEGORIES[app.category] || { name: app.category, color: '#6366f1' };
    const iconHtml = app.iconUrl 
        ? `<img src="${app.iconUrl}" alt="${app.name}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;" onerror="this.parentElement.innerHTML='<i class=\\'${app.icon}\\'></i>'">`
        : `<i class="${app.icon}"></i>`;
    
    let releasesHtml = '';
    if (app.hasReleases) {
        releasesHtml = `<div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-dark); border-radius: 12px;">
            <h3><i class="fas fa-code-branch"></i> Релизы</h3>
            <a href="https://github.com/${app.githubRepo}/releases" target="_blank" style="color: var(--success-color);">Скачать последнюю версию</a>
        </div>`;
    } else {
        releasesHtml = `<div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-dark); border-radius: 12px; border: 1px dashed var(--border-color);">
            <p style="color: var(--text-secondary); text-align: center;"><i class="fas fa-info-circle"></i> В этом репозитории нет релизов</p>
        </div>`;
    }
    
    elements.appDetail.innerHTML = `
        <div class="app-detail-header">
            <div class="app-detail-icon" style="background: ${cat.color}20;">${iconHtml}</div>
            <div class="app-detail-info">
                <h2>${app.name}</h2>
                <p class="developer">${app.developer}</p>
                <div class="app-detail-meta">
                    <div class="app-detail-meta-item"><i class="fas fa-star" style="color: var(--warning-color);"></i><span>${app.rating}</span></div>
                    <div class="app-detail-meta-item"><i class="fas fa-download"></i><span>${formatNumber(app.downloads)}</span></div>
                    <div class="app-detail-meta-item"><i class="fas fa-hdd"></i><span>${app.size}</span></div>
                    ${app.isLinux ? '<div class="app-detail-meta-item"><i class="fab fa-linux" style="color: #fbbf24;"></i><span>Linux</span></div>' : ''}
                </div>
            </div>
        </div>
        <div class="app-detail-description"><h3>О приложении</h3><p>${app.longDescription || app.description}</p></div>
        ${releasesHtml}
        <div class="app-detail-actions" style="margin-top: 1.5rem;">
            <a href="https://github.com/${app.githubRepo}/releases" target="_blank" class="download-btn"><i class="fas fa-download"></i>Скачать</a>
            <a href="https://github.com/${app.githubRepo}" target="_blank" class="download-btn" style="background: var(--bg-hover);"><i class="fab fa-github"></i>GitHub</a>
            <button class="favorite-btn ${state.favorites.includes(app.id) ? 'active' : ''}" onclick="toggleFavorite(${app.id})"><i class="${state.favorites.includes(app.id) ? 'fas' : 'far'} fa-heart"></i></button>
        </div>
    `;
    
    elements.appModal.classList.add('active');
}

function setupEventListeners() {
    console.log('Open Store: Настройка обработчиков...');
    
    // Поиск и фильтры
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function(e) {
            state.filters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }
    
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('change', function(e) {
            state.filters.category = e.target.value;
            applyFilters();
        });
    }
    
    if (elements.priceFilter) {
        elements.priceFilter.addEventListener('change', function(e) {
            state.filters.price = e.target.value;
            applyFilters();
        });
    }
    
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', function(e) {
            state.filters.sort = e.target.value;
            applyFilters();
        });
    }
    
    // Платформа
    document.querySelectorAll('input[name="platform"]').forEach(function(radio) {
        radio.addEventListener('change', function(e) {
            state.filters.platform = e.target.value;
            applyFilters();
        });
    });
    
    // Рейтинг
    document.querySelectorAll('input[name="rating"]').forEach(function(radio) {
        radio.addEventListener('change', function(e) {
            state.filters.rating = e.target.value;
            applyFilters();
        });
    });
    
    // Сброс фильтров
    if (elements.resetFilters) {
        elements.resetFilters.addEventListener('click', function() {
            state.filters = { search: '', category: 'all', rating: 'all', price: 'all', platform: 'all', sort: 'popular' };
            elements.searchInput.value = '';
            elements.categoryFilter.value = 'all';
            elements.priceFilter.value = 'all';
            elements.sortSelect.value = 'popular';
            document.querySelector('input[name="rating"][value="all"]').checked = true;
            document.querySelector('input[name="platform"][value="all"]').checked = true;
            applyFilters();
        });
    }
    
    // Вкладки авторизации
    document.querySelectorAll('.auth-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(this.dataset.tab + 'Form').classList.add('active');
        });
    });
    
    // Кнопка входа
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', handleLoginBtn);
    }
    
    // Закрытие модальных окон
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', function() {
            elements.loginModal.classList.remove('active');
        });
    }
    
    if (elements.closeAppModal) {
        elements.closeAppModal.addEventListener('click', function() {
            elements.appModal.classList.remove('active');
        });
    }
    
    if (elements.closeProfileModal) {
        elements.closeProfileModal.addEventListener('click', function() {
            elements.profileModal.classList.remove('active');
        });
    }
    
    if (elements.closeEditProfileModal) {
        elements.closeEditProfileModal.addEventListener('click', function() {
            elements.editProfileModal.classList.remove('active');
        });
    }
    
    if (elements.closeAddAppModal) {
        elements.closeAddAppModal.addEventListener('click', function() {
            elements.addAppModal.classList.remove('active');
        });
    }
    
    if (elements.closeAdmin) {
        elements.closeAdmin.addEventListener('click', function() {
            elements.adminPanel.classList.remove('active');
        });
    }
    
    // Формы
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    if (elements.editProfileForm) {
        elements.editProfileForm.addEventListener('submit', saveProfile);
    }
    
    if (elements.addAppForm) {
        elements.addAppForm.addEventListener('submit', addApp);
    }
    
    // Вкладки профиля
    document.querySelectorAll('.profile-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
        });
    });
    
    // Кнопки профиля
    if (elements.addAppBtn) {
        elements.addAppBtn.addEventListener('click', function() {
            elements.profileModal.classList.remove('active');
            elements.addAppModal.classList.add('active');
        });
    }
    
    if (elements.editProfileBtn) {
        elements.editProfileBtn.addEventListener('click', openEditProfile);
    }
    
    if (elements.deleteAccountBtn) {
        elements.deleteAccountBtn.addEventListener('click', deleteAccount);
    }
    
    // Вкладки админ-панели
    document.querySelectorAll('.admin-panel .tab-btn').forEach(function(tab) {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            document.querySelectorAll('.admin-panel .tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.admin-panel .tab-content').forEach(c => c.classList.remove('active'));
            const content = document.getElementById(tabName + 'Tab');
            if (content) {
                content.classList.add('active');
            }
            
            if (tabName === 'users') renderAdminUsers();
            if (tabName === 'apps') renderAdminApps();
            if (tabName === 'messages') renderAdminMessages();
            if (tabName === 'moderation') renderModerationApps();
        });
    });
    
    // Админ сообщения
    const adminMessageForm = document.getElementById('adminMessageForm');
    if (adminMessageForm) {
        adminMessageForm.addEventListener('submit', sendAdminMessage);
    }
    
    // ESC для закрытия
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (elements.loginModal) elements.loginModal.classList.remove('active');
            if (elements.appModal) elements.appModal.classList.remove('active');
            if (elements.profileModal) elements.profileModal.classList.remove('active');
            if (elements.editProfileModal) elements.editProfileModal.classList.remove('active');
            if (elements.addAppModal) elements.addAppModal.classList.remove('active');
            if (elements.adminPanel) elements.adminPanel.classList.remove('active');
        }
    });
    
    console.log('Open Store: Обработчики настроены');
}

function applyFilters() {
    let filtered = [...state.apps];
    
    if (state.filters.search) {
        const s = state.filters.search;
        filtered = filtered.filter(app => 
            app.name.toLowerCase().includes(s) || 
            app.developer.toLowerCase().includes(s) || 
            app.description.toLowerCase().includes(s)
        );
    }
    
    if (state.filters.category !== 'all') {
        filtered = filtered.filter(app => app.category === state.filters.category);
    }
    
    if (state.filters.platform === 'linux') {
        filtered = filtered.filter(app => app.isLinux);
    }
    
    if (state.filters.rating !== 'all') {
        const min = parseFloat(state.filters.rating);
        filtered = filtered.filter(app => app.rating >= min);
    }
    
    if (state.filters.price !== 'all') {
        filtered = filtered.filter(app => app.price === state.filters.price);
    }
    
    switch (state.filters.sort) {
        case 'popular': filtered.sort((a, b) => b.downloads - a.downloads); break;
        case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    
    state.filteredApps = filtered;
    renderApps();
}

function handleLoginBtn() {
    if (state.currentUser) {
        elements.profileModal.classList.add('active');
        renderProfile();
    } else {
        elements.loginModal.classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (username === 'misha' && password === 'mien0203') {
        state.currentUser = { name: 'misha', role: 'admin', email: 'admin@openstore.com', bio: '', rating: 5.0, downloads: 0, appsCount: 0 };
        saveToStorage();
        updateUI();
        elements.loginModal.classList.remove('active');
        elements.adminPanel.classList.add('active');
        setTimeout(renderAdminPanel, 100);
        showNotification('Добро пожаловать, администратор!');
        return;
    }
    
    const user = state.users.find(u => u.name === username && u.password === password);
    if (user) {
        state.currentUser = user;
        state.favorites = user.favorites || [];
        saveToStorage();
        updateUI();
        elements.loginModal.classList.remove('active');
        showNotification('Добро пожаловать, ' + user.name + '!');
    } else {
        showNotification('Неверное имя пользователя или пароль', true);
    }
    elements.loginForm.reset();
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== confirm) {
        showNotification('Пароли не совпадают', true);
        return;
    }
    
    if (state.users.find(u => u.name === username)) {
        showNotification('Пользователь уже существует', true);
        return;
    }
    
    const newUser = {
        name: username,
        email: username + '@openstore.com',
        password: password,
        role: 'user',
        bio: '',
        rating: 0,
        reviews: [],
        favorites: [],
        apps: [],
        downloads: 0,
        appsCount: 0,
        joinedAt: new Date().toISOString()
    };
    
    state.users.push(newUser);
    state.currentUser = newUser;
    saveToStorage();
    updateUI();
    elements.loginModal.classList.remove('active');
    showNotification('Регистрация успешна!');
    elements.registerForm.reset();
}

function updateUI() {
    if (state.currentUser) {
        elements.loginBtn.innerHTML = '<i class="fas fa-user"></i><span>' + state.currentUser.name + '</span>';
        elements.loginBtn.classList.add('active');
        if (state.currentUser.role === 'admin') {
            elements.loginBtn.innerHTML += ' <i class="fas fa-shield-alt" style="margin-left: 0.5rem; color: var(--warning-color);"></i>';
        }
    } else {
        elements.loginBtn.innerHTML = '<i class="fas fa-user"></i><span>Войти</span>';
        elements.loginBtn.classList.remove('active');
    }
}

function renderProfile() {
    const user = state.currentUser;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email || '';
    document.getElementById('profileDownloads').textContent = formatNumber(user.downloads || 0);
    document.getElementById('profileRating').textContent = (user.rating || 0).toFixed(1);
    document.getElementById('profileApps').textContent = (user.apps || []).length;
    
    if (elements.deleteAccountBtn) {
        elements.deleteAccountBtn.style.display = user.role === 'admin' ? 'none' : 'flex';
    }
    
    renderUserApps();
    renderFavorites();
    renderReviews();
}

function renderUserApps() {
    const list = document.getElementById('userAppsList');
    const apps = state.currentUser.apps || [];
    if (apps.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет приложений</p>';
        return;
    }
    list.innerHTML = apps.map(function(app) {
        return '<div class="user-app-item"><div class="user-app-info"><h4>' + app.name + '</h4><p>' + (app.description || '') + '</p></div></div>';
    }).join('');
}

function renderFavorites() {
    const list = document.getElementById('favoritesList');
    const favApps = state.apps.filter(function(a) { return state.favorites.includes(a.id); });
    if (favApps.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет избранных</p>';
        return;
    }
    list.innerHTML = favApps.map(function(app) {
        return '<div class="user-app-item"><div class="user-app-info"><h4>' + app.name + '</h4><p>' + app.description + '</p></div></div>';
    }).join('');
}

function renderReviews() {
    const list = document.getElementById('reviewsList');
    const reviews = state.currentUser.reviews || [];
    if (reviews.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет отзывов</p>';
        return;
    }
    list.innerHTML = reviews.map(function(r) {
        return '<div class="user-review-item"><div class="user-app-info"><h4>' + r.appName + '</h4><div class="rating"><i class="fas fa-star"></i><span>' + r.rating + '</span></div><p>' + r.text + '</p></div></div>';
    }).join('');
}

function openEditProfile() {
    document.getElementById('editUsername').value = state.currentUser.name;
    document.getElementById('editEmail').value = state.currentUser.email || '';
    document.getElementById('editBio').value = state.currentUser.bio || '';
    elements.profileModal.classList.remove('active');
    elements.editProfileModal.classList.add('active');
}

function saveProfile(e) {
    e.preventDefault();
    state.currentUser.name = document.getElementById('editUsername').value.trim();
    state.currentUser.email = document.getElementById('editEmail').value.trim();
    state.currentUser.bio = document.getElementById('editBio').value.trim();
    const pass = document.getElementById('editPassword').value;
    if (pass) state.currentUser.password = pass;
    
    const idx = state.users.findIndex(function(u) { return u.name === state.currentUser.name; });
    if (idx !== -1) state.users[idx] = state.currentUser;
    
    saveToStorage();
    updateUI();
    elements.editProfileModal.classList.remove('active');
    showNotification('Профиль обновлён!');
}

function deleteAccount() {
    if (confirm('Вы уверены?')) {
        state.users = state.users.filter(function(u) { return u.name !== state.currentUser.name; });
        state.currentUser = null;
        state.favorites = [];
        saveToStorage();
        updateUI();
        elements.profileModal.classList.remove('active');
        showNotification('Аккаунт удалён');
    }
}

function addApp(e) {
    e.preventDefault();
    const newApp = {
        id: Date.now(),
        name: document.getElementById('appName').value,
        description: document.getElementById('appDescription').value,
        longDescription: document.getElementById('appLongDescription').value,
        category: document.getElementById('appCategory').value,
        price: document.getElementById('appPrice').value,
        githubRepo: document.getElementById('appGithub').value,
        version: document.getElementById('appVersion').value || '1.0.0',
        isLinux: document.getElementById('appIsLinux').checked,
        developer: state.currentUser.name,
        rating: 0,
        reviews: 0,
        downloads: 0,
        size: 'Unknown',
        icon: 'fas fa-cube',
        iconUrl: '',
        releaseDate: new Date().toISOString().split('T')[0],
        hasReleases: false,
        releases: [],
        stars: 0,
        forks: 0,
        language: 'Unknown',
        pending: true
    };
    
    state.userApps.push(newApp);
    state.currentUser.apps = state.currentUser.apps || [];
    state.currentUser.apps.push(newApp);
    state.currentUser.appsCount = state.currentUser.apps.length;
    
    saveToStorage();
    elements.addAppModal.classList.remove('active');
    showNotification('Приложение отправлено на модерацию!');
    document.getElementById('addAppForm').reset();
    renderProfile();
}

// Админ-панель
function renderAdminPanel() {
    document.getElementById('adminUserCount').textContent = state.users.length + 1;
    document.getElementById('adminAppCount').textContent = state.apps.length + state.userApps.length;
    
    const totalDownloads = state.apps.reduce(function(sum, a) { return sum + (a.downloads || 0); }, 0);
    document.getElementById('adminDownloadCount').textContent = formatNumber(totalDownloads);
    
    renderAdminUsers();
    renderAdminApps();
    renderAdminMessages();
    renderModerationApps();
}

function renderAdminUsers() {
    const list = document.getElementById('adminUsersList');
    const allUsers = state.users.concat([{ name: 'misha', role: 'admin', email: 'admin@openstore.com' }]);
    
    list.innerHTML = allUsers.map(function(u) {
        return '<div class="admin-user-item"><div class="admin-user-info"><div class="profile-avatar" style="width: 40px; height: 40px; font-size: 1.5rem;"><i class="fas fa-user"></i></div><div><strong>' + u.name + '</strong><span style="color: var(--text-secondary); font-size: 0.85rem;">' + (u.role === 'admin' ? '👑 Админ' : 'Пользователь') + '</span></div></div><div class="admin-user-actions">' + (u.name !== 'misha' ? '<button class="admin-btn danger" onclick="adminDeleteUser(\'' + u.name + '\')"><i class="fas fa-trash"></i></button>' : '') + '</div></div>';
    }).join('');
}

function renderAdminApps() {
    const list = document.getElementById('adminAppsList');
    const allApps = state.apps.slice(0, 20).concat(state.userApps);
    
    list.innerHTML = allApps.map(function(a) {
        return '<div class="admin-app-item"><div class="admin-app-info"><div class="app-card-icon" style="width: 40px; height: 40px; font-size: 1.5rem;"><i class="' + (a.icon || 'fas fa-cube') + '"></i></div><div><strong>' + a.name + '</strong><span style="color: var(--text-secondary); font-size: 0.85rem;">' + a.developer + '</span></div></div><div class="admin-app-actions"><button class="admin-btn danger" onclick="adminDeleteApp(\'' + a.name + '\')"><i class="fas fa-trash"></i></button></div></div>';
    }).join('');
}

function renderAdminMessages() {
    const list = document.getElementById('adminMessagesHistory');
    const messages = state.siteMessages || [];
    
    if (messages.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">Нет сообщений</p>';
        return;
    }
    
    list.innerHTML = messages.map(function(m) {
        return '<div class="message-history-item"><h4>' + m.title + '</h4><p>' + m.content + '</p><small>' + new Date(m.date).toLocaleString('ru-RU') + ' - ' + (m.toAll ? 'Всем' : 'Админам') + '</small></div>';
    }).join('');
}

// Модерация приложений
function renderModerationApps() {
    const list = document.getElementById('moderationAppsList');
    if (!list) return;
    
    const pendingApps = state.userApps.filter(function(a) { return a.pending; });
    
    if (pendingApps.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет приложений на модерации</p>';
        return;
    }
    
    list.innerHTML = pendingApps.map(function(app) {
        return '<div class="admin-app-item" style="flex-direction: column; align-items: flex-start; gap: 0.75rem;">' +
            '<div class="admin-app-info" style="width: 100%;">' +
            '<div class="app-card-icon" style="width: 40px; height: 40px; font-size: 1.5rem;"><i class="' + (app.icon || 'fas fa-cube') + '"></i></div>' +
            '<div>' +
            '<strong>' + app.name + '</strong>' +
            '<span style="color: var(--text-secondary); font-size: 0.85rem;"> от ' + app.developer + '</span>' +
            '</div>' +
            '</div>' +
            '<p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">' + (app.description || '') + '</p>' +
            '<p style="color: var(--text-secondary); font-size: 0.75rem; margin: 0;">GitHub: ' + (app.githubRepo || '') + '</p>' +
            '<div class="admin-app-actions" style="margin-top: 0.5rem;">' +
            '<button class="admin-btn" style="color: var(--success-color); border-color: var(--success-color);" onclick="approveApp(' + app.id + ')"><i class="fas fa-check"></i> Принять</button>' +
            '<button class="admin-btn danger" onclick="rejectApp(' + app.id + ')"><i class="fas fa-times"></i> Отклонить</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

window.approveApp = function(appId) {
    const appIndex = state.userApps.findIndex(function(a) { return a.id === appId; });
    if (appIndex === -1) return;
    
    const app = state.userApps[appIndex];
    app.pending = false;
    app.id = Date.now() + Math.random(); // Новый ID для основного списка
    
    // Добавляем в основной список
    state.apps.unshift(app);
    
    // Обновляем у пользователя
    if (state.currentUser.name === app.developer) {
        state.currentUser.apps = state.currentUser.apps.filter(function(a) { return a.id !== appId; });
    } else {
        const user = state.users.find(function(u) { return u.name === app.developer; });
        if (user) {
            user.apps = user.apps.filter(function(a) { return a.id !== appId; });
        }
    }
    
    // Удаляем из pending
    state.userApps.splice(appIndex, 1);
    
    saveToStorage();
    renderAdminPanel();
    renderModerationApps();
    showNotification('Приложение "' + app.name + '" принято и опубликовано!');
};

window.rejectApp = function(appId) {
    const appIndex = state.userApps.findIndex(function(a) { return a.id === appId; });
    if (appIndex === -1) return;
    
    const app = state.userApps[appIndex];
    const appName = app.name;
    
    // Удаляем из pending и у пользователя
    state.userApps.splice(appIndex, 1);
    
    if (state.currentUser.name === app.developer) {
        state.currentUser.apps = state.currentUser.apps.filter(function(a) { return a.id !== appId; });
    } else {
        const user = state.users.find(function(u) { return u.name === app.developer; });
        if (user) {
            user.apps = user.apps.filter(function(a) { return a.id !== appId; });
        }
    }
    
    saveToStorage();
    renderAdminPanel();
    renderModerationApps();
    showNotification('Приложение "' + appName + '" отклонено');
};

function sendAdminMessage(e) {
    e.preventDefault();
    const message = {
        id: Date.now(),
        title: document.getElementById('messageTitle').value,
        content: document.getElementById('messageContent').value,
        date: new Date().toISOString(),
        toAll: document.getElementById('messageToAll').checked
    };
    
    state.siteMessages.unshift(message);
    saveToStorage();
    renderAdminMessages();
    renderSiteMessages();
    showNotification('Сообщение отправлено!');
    document.getElementById('adminMessageForm').reset();
}

function renderSiteMessages() {
    if (!elements.siteMessages) return;
    
    const messages = state.siteMessages || [];
    elements.siteMessages.innerHTML = messages.map(function(m) {
        return '<div class="site-message"><i class="fas fa-bullhorn"></i><div class="site-message-content"><h4>' + m.title + '</h4><p>' + m.content + '</p></div><button class="site-message-close" onclick="this.parentElement.remove()">&times;</button></div>';
    }).join('');
}

// Глобальные функции
window.toggleFavorite = function(appId) {
    const idx = state.favorites.indexOf(appId);
    if (idx === -1) {
        state.favorites.push(appId);
        showNotification('Добавлено в избранное');
    } else {
        state.favorites.splice(idx, 1);
        showNotification('Удалено из избранного');
    }
    saveToStorage();
    
    const btn = document.querySelector('.favorite-btn');
    if (btn) {
        const isFav = state.favorites.includes(appId);
        btn.classList.toggle('active', isFav);
        btn.innerHTML = '<i class="' + (isFav ? 'fas' : 'far') + ' fa-heart"></i>';
    }
};

window.adminDeleteUser = function(name) {
    if (confirm('Удалить пользователя ' + name + '?')) {
        state.users = state.users.filter(function(u) { return u.name !== name; });
        saveToStorage();
        renderAdminPanel();
        showNotification('Пользователь удалён');
    }
};

window.adminDeleteApp = function(name) {
    if (confirm('Удалить приложение ' + name + '?')) {
        state.apps = state.apps.filter(function(a) { return a.name !== name; });
        state.userApps = state.userApps.filter(function(a) { return a.name !== name; });
        saveToStorage();
        renderAdminPanel();
        showNotification('Приложение удалено');
    }
};

window.deleteUserApp = function(id) {
    if (confirm('Удалить приложение?')) {
        state.userApps = state.userApps.filter(function(a) { return a.id !== id; });
        state.currentUser.apps = state.currentUser.apps.filter(function(a) { return a.id !== id; });
        saveToStorage();
        renderProfile();
        showNotification('Приложение удалено');
    }
};

// Хранение
function loadFromStorage() {
    try {
        const savedUser = localStorage.getItem('openstore_user');
        if (savedUser) state.currentUser = JSON.parse(savedUser);
        
        const savedUsers = localStorage.getItem('openstore_all_users');
        if (savedUsers) state.users = JSON.parse(savedUsers);
        
        const savedFavs = localStorage.getItem('openstore_favorites');
        if (savedFavs) state.favorites = JSON.parse(savedFavs);
        
        const savedApps = localStorage.getItem('openstore_user_apps');
        if (savedApps) state.userApps = JSON.parse(savedApps);
        
        const savedMessages = localStorage.getItem('openstore_messages');
        if (savedMessages) state.siteMessages = JSON.parse(savedMessages);
        
        updateUI();
    } catch (e) {
        console.error('Ошибка загрузки из хранилища:', e);
    }
}

function saveToStorage() {
    try {
        if (state.currentUser) localStorage.setItem('openstore_user', JSON.stringify(state.currentUser));
        localStorage.setItem('openstore_all_users', JSON.stringify(state.users));
        localStorage.setItem('openstore_favorites', JSON.stringify(state.favorites));
        localStorage.setItem('openstore_user_apps', JSON.stringify(state.userApps));
        localStorage.setItem('openstore_messages', JSON.stringify(state.siteMessages));
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}

function showLoading(show) {
    if (elements.loading) elements.loading.classList.toggle('active', show);
    if (elements.appsGrid) elements.appsGrid.style.display = show ? 'none' : 'grid';
}

function showNotification(text, isError) {
    if (!elements.notification) return;
    
    elements.notificationText.textContent = text;
    elements.notification.classList.toggle('error', isError || false);
    elements.notification.classList.add('active');
    
    setTimeout(function() {
        elements.notification.classList.remove('active');
    }, 3000);
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}
