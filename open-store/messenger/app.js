// Open Messenger - Интеграция с Open Store

const OPEN_STORE_PATH = '../open-store/app.js';

window.state = {
    currentUser: null,
    users: [],
    chats: [],
    messages: [],
    activeChat: null,
    blockedUsers: {},
    viewingProfile: null
};

// Инициализация
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('Open Messenger: Загрузка...');
    
    // Загружаем данные из Open Store
    await loadOpenStoreData();
    
    // Проверяем авторизацию
    checkAuth();
    
    setupEventListeners();
    
    // Запускаем Firebase синхронизацию ПОСЛЕ полной инициализации
    if (typeof startFirebaseSync === 'function') {
        console.log('Запуск Firebase синхронизации...');
        startFirebaseSync();
    }
}

// Загрузка данных из Open Store
async function loadOpenStoreData() {
    try {
        // Загружаем пользователей из Open Store
        const storedUsers = localStorage.getItem('openstore_all_users');
        if (storedUsers) {
            state.users = JSON.parse(storedUsers);
        }
        
        // Добавляем админа
        const adminExists = state.users.find(u => u.name === 'misha');
        if (!adminExists) {
            state.users.push({
                name: 'misha',
                email: 'admin@openstore.com',
                role: 'admin'
            });
        }
        
        // Загружаем сообщения
        const storedMessages = localStorage.getItem('openmessenger_messages');
        if (storedMessages) {
            state.messages = JSON.parse(storedMessages);
        }
        
        // Загружаем заблокированных пользователей
        const storedBlocks = localStorage.getItem('openmessenger_blocks');
        if (storedBlocks) {
            state.blockedUsers = JSON.parse(storedBlocks);
            // Очищаем истёкшие блокировки
            const now = Date.now();
            Object.keys(state.blockedUsers).forEach(function(username) {
                if (state.blockedUsers[username] !== 'permanent' && state.blockedUsers[username] < now) {
                    delete state.blockedUsers[username];
                }
            });
            saveBlockedUsers();
        }
        
        console.log('Open Messenger: Данные загружены', state.users.length, 'пользователей');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Проверка авторизации
function checkAuth() {
    const storedUser = localStorage.getItem('openstore_user');
    if (storedUser) {
        state.currentUser = JSON.parse(storedUser);
        showMessenger();
    } else {
        showAuth();
    }
}

function showAuth() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('messengerContainer').style.display = 'none';
}

function showMessenger() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('messengerContainer').style.display = 'flex';
    
    // Обновляем профиль
    document.getElementById('currentUserName').textContent = state.currentUser.name;
    
    // Загружаем чаты
    loadChats();
}

// Вкладки авторизации
function switchAuth(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.auth-tab[data-tab="' + tab + '"]').classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(tab + 'Form').classList.add('active');
}

// Вход
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Проверяем админа
    if (username === 'misha' && password === 'mien0203') {
        state.currentUser = { name: 'misha', role: 'admin', email: 'admin@openstore.com' };
        localStorage.setItem('openstore_user', JSON.stringify(state.currentUser));
        showMessenger();
        showNotification('Добро пожаловать!');
        return;
    }
    
    // Ищем пользователя
    const user = state.users.find(u => u.name === username && u.password === password);
    if (user) {
        state.currentUser = user;
        localStorage.setItem('openstore_user', JSON.stringify(state.currentUser));
        showMessenger();
        showNotification('Добро пожаловать, ' + user.name + '!');
    } else {
        showNotification('Неверное имя пользователя или пароль', true);
    }
    
    this.reset();
});

// Регистрация
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== confirm) {
        showNotification('Пароли не совпадают', true);
        return;
    }
    
    // Проверяем существование
    if (state.users.find(u => u.name === username)) {
        showNotification('Пользователь уже существует', true);
        return;
    }
    
    // Создаём пользователя
    const newUser = {
        name: username,
        email: username + '@openstore.com',
        password: password,
        role: 'user',
        joinedAt: new Date().toISOString()
    };
    
    state.users.push(newUser);
    saveUsers();
    
    // Автоматический вход
    state.currentUser = newUser;
    localStorage.setItem('openstore_user', JSON.stringify(state.currentUser));
    
    showMessenger();
    showNotification('Регистрация успешна!');
    this.reset();
});

function saveUsers() {
    localStorage.setItem('openstore_all_users', JSON.stringify(state.users));
}

// Загрузка чатов
function loadChats() {
    const chatList = document.getElementById('chatList');
    
    // Получаем всех пользователей кроме текущего
    const otherUsers = window.state.users.filter(function(u) { 
        return u.name !== window.state.currentUser.name; 
    });
    
    console.log('Загрузка чатов:', otherUsers.length, 'пользователей');
    
    if (otherUsers.length === 0) {
        chatList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);"><i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i><p>Нет других пользователей</p><p style="font-size: 0.85rem;">Зарегистрируйтесь на другом устройстве</p></div>';
        return;
    }
    
    chatList.innerHTML = otherUsers.map(function(user) {
        // Получаем последние сообщения
        const userMessages = window.state.messages.filter(function(m) {
            return (m.from === window.state.currentUser.name && m.to === user.name) ||
                   (m.from === user.name && m.to === window.state.currentUser.name);
        });
        
        const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
        const unreadCount = userMessages.filter(function(m) {
            return m.to === window.state.currentUser.name && !m.read;
        }).length;
        
        return '<div class="chat-item" onclick="openChat(\'' + user.name + '\')">' +
            '<div class="chat-item-avatar online"><i class="fas fa-user"></i></div>' +
            '<div class="chat-item-info">' +
            '<div class="chat-item-header">' +
            '<span class="chat-item-name">' + user.name + '</span>' +
            '<span class="chat-item-time">' + (lastMessage ? formatTime(lastMessage.time) : '') + '</span>' +
            '</div>' +
            '<div class="chat-item-message">' + (lastMessage ? lastMessage.text : 'Нет сообщений') + '</div>' +
            '</div>' +
            (unreadCount > 0 ? '<span class="chat-item-badge">' + unreadCount + '</span>' : '') +
            '</div>';
    }).join('');
}

// Открытие чата
function openChat(username) {
    state.activeChat = username;
    
    // Обновляем активный класс
    document.querySelectorAll('.chat-item').forEach(function(item) {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Показываем окно чата
    document.getElementById('noChatSelected').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'flex';
    
    // Обновляем заголовок
    document.getElementById('chatUserName').textContent = username;
    
    // Загружаем сообщения
    loadMessages(username);
}

// Загрузка сообщений
function loadMessages(username) {
    const container = document.getElementById('messagesContainer');
    
    const chatMessages = state.messages.filter(function(m) {
        return (m.from === state.currentUser.name && m.to === username) ||
               (m.from === username && m.to === state.currentUser.name);
    });
    
    if (chatMessages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Начните общение</p>';
        return;
    }
    
    container.innerHTML = chatMessages.map(function(msg) {
        const isOutgoing = msg.from === state.currentUser.name;
        let fileHtml = '';
        
        if (msg.type === 'file' && msg.file) {
            fileHtml = '<div class="message-file">' +
                '<i class="fas fa-file"></i>' +
                '<div class="message-file-info">' +
                '<div class="message-file-name">' + escapeHtml(msg.file.name) + '</div>' +
                '<div class="message-file-size">' + formatFileSize(msg.file.size) + '</div>' +
                '</div>' +
                '<a href="' + msg.file.url + '" download="' + escapeHtml(msg.file.name) + '" class="message-file-download" title="Скачать"><i class="fas fa-download"></i></a>' +
                '</div>';
        }
        
        return '<div class="message ' + (isOutgoing ? 'outgoing' : 'incoming') + '">' +
            '<div class="message-avatar"><i class="fas fa-user"></i></div>' +
            '<div class="message-content">' +
            '<div class="message-text">' + escapeHtml(msg.text) + '</div>' +
            fileHtml +
            '<div class="message-time">' + formatMessageTime(msg.time) + '</div>' +
            '</div>' +
            '</div>';
    }).join('');
    
    // Прокрутка вниз
    container.scrollTop = container.scrollHeight;
    
    // Помечаем как прочитанные
    state.messages.forEach(function(m) {
        if (m.to === state.currentUser.name && m.from === username) {
            m.read = true;
        }
    });
    saveMessages();
    
    // Обновляем иконку блокировки
    updateBlockIcon();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Отправка сообщения
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !state.activeChat) return;
    
    const message = {
        id: Date.now(),
        from: state.currentUser.name,
        to: state.activeChat,
        text: text,
        time: new Date().toISOString(),
        read: false
    };
    
    state.messages.push(message);
    saveMessages();
    
    input.value = '';
    loadMessages(state.activeChat);
    loadChats();
    
    showNotification('Сообщение отправлено');
}

// Отправка по Enter
document.getElementById('messageInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Обработка выбора файла
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || !state.activeChat) return;
    
    // Проверка размера (2GB = 2 * 1024 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('Файл слишком большой. Максимум 2GB', true);
        return;
    }
    
    // Проверка блокировки
    if (isUserBlocked(state.activeChat)) {
        showNotification('Пользователь заблокирован', true);
        return;
    }
    
    showUploadProgress(file.name);
    
    // Имитация загрузки (в реальности здесь была бы загрузка на сервер)
    simulateFileUpload(file, function(fileData) {
        const message = {
            id: Date.now(),
            from: state.currentUser.name,
            to: state.activeChat,
            text: '📎 Файл: ' + file.name,
            time: new Date().toISOString(),
            read: false,
            type: 'file',
            file: fileData
        };
        
        state.messages.push(message);
        saveMessages();
        
        hideUploadProgress();
        loadMessages(state.activeChat);
        loadChats();
        showNotification('Файл отправлен!');
    });
    
    // Очищаем input
    event.target.value = '';
}

// Имитация загрузки файла
function simulateFileUpload(file, callback) {
    let progress = 0;
    const interval = setInterval(function() {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Создаём данные файла (в реальности это было бы URL)
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file)
            };
            
            callback(fileData);
        }
        updateUploadProgress(progress);
    }, 200);
}

function showUploadProgress(fileName) {
    const progressEl = document.getElementById('uploadProgress');
    document.getElementById('uploadFileName').textContent = fileName;
    progressEl.style.display = 'block';
}

function updateUploadProgress(progress) {
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('uploadProgressText').textContent = Math.round(progress) + '%';
}

function hideUploadProgress() {
    setTimeout(function() {
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
    }, 1000);
}

// Просмотр профиля пользователя
function viewUserProfile() {
    if (!state.activeChat) return;
    
    const user = state.users.find(function(u) { return u.name === state.activeChat; });
    if (!user) return;
    
    state.viewingProfile = user;
    
    document.getElementById('viewProfileName').textContent = user.name;
    document.getElementById('viewProfileEmail').textContent = user.email || 'email@example.com';
    
    // Дата регистрации
    const joinedDate = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('ru-RU') : 'Неизвестно';
    document.getElementById('viewProfileJoined').textContent = joinedDate;
    
    // Количество приложений (из Open Store)
    const userApps = user.apps ? user.apps.length : 0;
    document.getElementById('viewProfileApps').textContent = userApps;
    
    // Роль
    document.getElementById('viewProfileRole').textContent = user.role === 'admin' ? '👑 Администратор' : '👤 Пользователь';
    
    document.getElementById('userProfileModal').classList.add('active');
}

function closeUserProfileModal() {
    document.getElementById('userProfileModal').classList.remove('active');
    state.viewingProfile = null;
}

function sendMessageToUser() {
    closeUserProfileModal();
    if (state.viewingProfile) {
        openChatByUsername(state.viewingProfile.name);
    }
}

function openChatByUsername(username) {
    // Находим чат в списке и кликаем
    const chatItems = document.querySelectorAll('.chat-item');
    for (let i = 0; i < chatItems.length; i++) {
        const nameEl = chatItems[i].querySelector('.chat-item-name');
        if (nameEl && nameEl.textContent === username) {
            chatItems[i].click();
            return;
        }
    }
}

function blockUserFromProfile() {
    closeUserProfileModal();
    if (state.viewingProfile) {
        state.activeChat = state.viewingProfile.name;
        openBlockModal();
    }
}

// Блокировка пользователя
function toggleBlockUser() {
    if (!state.activeChat) return;
    openBlockModal();
}

function openBlockModal() {
    document.getElementById('blockUserModal').classList.add('active');
}

function closeBlockModal() {
    document.getElementById('blockUserModal').classList.remove('active');
}

function selectBlockDuration(duration) {
    if (!state.activeChat) return;
    
    const until = duration === 'permanent' ? 'permanent' : Date.now() + duration;
    state.blockedUsers[state.activeChat] = until;
    saveBlockedUsers();
    
    closeBlockModal();
    
    const durationText = duration === 'permanent' ? 'навсегда' : formatDuration(duration);
    showNotification('Пользователь заблокирован на ' + durationText);
    
    // Обновляем иконку
    updateBlockIcon();
}

function isUserBlocked(username) {
    const blockUntil = state.blockedUsers[username];
    if (!blockUntil) return false;
    
    if (blockUntil === 'permanent') return true;
    
    return blockUntil > Date.now();
}

function getBlockRemainingTime(username) {
    const blockUntil = state.blockedUsers[username];
    if (!blockUntil) return null;
    
    if (blockUntil === 'permanent') return 'Навсегда';
    
    const remaining = blockUntil - Date.now();
    if (remaining <= 0) return 'Истекло';
    
    return formatDuration(remaining);
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return days + ' дн.';
    if (hours > 0) return hours + ' ч.';
    if (minutes > 0) return minutes + ' мин.';
    return 'Меньше минуты';
}

function updateBlockIcon() {
    const icon = document.getElementById('blockIcon');
    if (state.activeChat && isUserBlocked(state.activeChat)) {
        icon.style.color = 'var(--danger-color)';
    } else {
        icon.style.color = '';
    }
}

function unblockUser() {
    if (!state.activeChat) return;
    
    delete state.blockedUsers[state.activeChat];
    saveBlockedUsers();
    updateBlockIcon();
    showNotification('Пользователь разблокирован');
}

function saveBlockedUsers() {
    localStorage.setItem('openmessenger_blocks', JSON.stringify(state.blockedUsers));
}

// ============================================
// ADMIN PANEL FUNCTIONS
// ============================================

function openAdminPanel() {
    // Проверка что пользователь админ
    if (!state.currentUser || state.currentUser.role !== 'admin') {
        showNotification('Только для администраторов!', true);
        return;
    }
    
    document.getElementById('adminPanelModal').classList.add('active');
    loadAdminPanelData();
}

function closeAdminPanel() {
    document.getElementById('adminPanelModal').classList.remove('active');
}

function switchAdminTab(tabName) {
    // Переключаем вкладки
    document.querySelectorAll('.admin-tab').forEach(function(tab) {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    document.querySelectorAll('.admin-tab-content').forEach(function(content) {
        content.classList.remove('active');
        if (content.id === tabName + 'Tab') {
            content.classList.add('active');
        }
    });
    
    // Загружаем данные для вкладки
    if (tabName === 'users') loadAdminUsers();
    if (tabName === 'messages') loadAdminMessages();
    if (tabName === 'bans') loadAdminBans();
}

function loadAdminPanelData() {
    loadAdminUsers();
    loadAdminMessages();
    loadAdminBans();
}

function loadAdminUsers() {
    const list = document.getElementById('adminUsersList');
    if (!list) return;
    
    const allUsers = state.users.concat([{ name: 'misha', role: 'admin', email: 'admin@openstore.com' }]);
    
    list.innerHTML = allUsers.map(function(user) {
        const isBlocked = isUserBlocked(user.name);
        const blockInfo = isBlocked ? getBlockRemainingTime(user.name) : null;
        
        return '<div class="admin-user-item">' +
            '<div class="admin-user-info">' +
            '<div class="admin-user-avatar"><i class="fas fa-user"></i></div>' +
            '<div class="admin-user-details">' +
            '<div class="admin-user-name">' + user.name + (user.role === 'admin' ? ' 👑' : '') + '</div>' +
            '<div class="admin-user-email">' + (user.email || 'email@example.com') + '</div>' +
            (isBlocked ? '<div style="color: var(--danger-color); font-size: 0.85rem;"><i class="fas fa-ban"></i> Заблокирован: ' + blockInfo + '</div>' : '') +
            '</div>' +
            '</div>' +
            '<div class="admin-user-actions">' +
            (user.name !== 'misha' ? (isBlocked ? 
                '<button class="admin-btn success" onclick="adminUnblockUser(\'' + user.name + '\')"><i class="fas fa-check"></i> Разблокировать</button>' :
                '<button class="admin-btn danger" onclick="adminBlockUser(\'' + user.name + '\')"><i class="fas fa-ban"></i> Заблокировать</button>') : '') +
            '</div>' +
            '</div>';
    }).join('');
}

function loadAdminMessages() {
    const list = document.getElementById('adminMessagesList');
    if (!list) return;
    
    const messages = state.siteMessages || [];
    
    if (messages.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет сообщений</p>';
        return;
    }
    
    list.innerHTML = messages.map(function(msg) {
        return '<div class="admin-message-item">' +
            '<div class="admin-message-header">' +
            '<span class="admin-message-title">' + escapeHtml(msg.title) + '</span>' +
            '<span class="admin-message-date">' + new Date(msg.date).toLocaleString('ru-RU') + '</span>' +
            '</div>' +
            '<div class="admin-message-content">' + escapeHtml(msg.content) + '</div>' +
            '<small style="color: var(--text-secondary);">' + (msg.toAll ? '📢 Всем пользователям' : '🔒 Только админам') + '</small>' +
            '</div>';
    }).join('');
}

function loadAdminBans() {
    const list = document.getElementById('adminBansList');
    if (!list) return;
    
    const blockedUsers = state.blockedUsers || {};
    const blockedKeys = Object.keys(blockedUsers);
    
    if (blockedKeys.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет активных блокировок</p>';
        return;
    }
    
    list.innerHTML = blockedKeys.map(function(username) {
        const blockUntil = blockedUsers[username];
        const isPermanent = blockUntil === 'permanent';
        const remaining = isPermanent ? 'Навсегда' : getBlockRemainingTime(username);
        const isExpired = !isPermanent && blockUntil < Date.now();
        
        return '<div class="admin-ban-item">' +
            '<div class="admin-ban-header">' +
            '<span class="admin-ban-user"><i class="fas fa-user"></i> ' + username + '</span>' +
            '<span class="admin-ban-duration">' + (isPermanent ? '∞ Навсегда' : remaining) + '</span>' +
            '</div>' +
            '<div class="admin-ban-info">' +
            (isPermanent ? 'Заблокирован навсегда' : 'Заблокирован до: ' + new Date(blockUntil).toLocaleString('ru-RU')) +
            '</div>' +
            '<div class="admin-ban-actions">' +
            '<button class="admin-btn success" onclick="adminUnblockUser(\'' + username + '\')"><i class="fas fa-check"></i> Разблокировать</button>' +
            (isExpired ? '<span style="color: var(--text-secondary);">(Истёк)</span>' : '') +
            '</div>' +
            '</div>';
    }).join('');
}

function adminBlockUser(username) {
    if (!confirm('Заблокировать пользователя ' + username + '?')) return;
    
    // Блокируем на 24 часа по умолчанию
    state.blockedUsers[username] = Date.now() + 86400000;
    saveBlockedUsers();
    
    showNotification('Пользователь ' + username + ' заблокирован на 24 часа');
    loadAdminUsers();
    loadAdminBans();
}

function adminUnblockUser(username) {
    delete state.blockedUsers[username];
    saveBlockedUsers();
    
    showNotification('Пользователь ' + username + ' разблокирован');
    loadAdminUsers();
    loadAdminBans();
}

function sendAdminMessage(e) {
    e.preventDefault();
    
    const title = document.getElementById('siteMessageTitle').value;
    const content = document.getElementById('siteMessageContent').value;
    const toAll = document.getElementById('siteMessageToAll').checked;
    
    const message = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toISOString(),
        toAll: toAll
    };
    
    state.siteMessages.unshift(message);
    saveSiteMessages();
    
    // Сохраняем в Open Store (для главного сайта)
    try {
        const existingMessages = JSON.parse(localStorage.getItem('openstore_messages') || '[]');
        existingMessages.unshift(message);
        localStorage.setItem('openstore_messages', JSON.stringify(existingMessages));
    } catch(e) {
        console.log('Ошибка сохранения сообщений:', e);
    }
    
    showNotification('Сообщение отправлено на сайт!');
    document.getElementById('adminSiteMessageForm').reset();
    loadAdminMessages();
}

function saveSiteMessages() {
    localStorage.setItem('openmessenger_messages', JSON.stringify(window.state.siteMessages));
}

// Мобильное меню
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Добавляем обработчик для формы сообщений
document.addEventListener('DOMContentLoaded', function() {
    const adminMessageForm = document.getElementById('adminSiteMessageForm');
    if (adminMessageForm) {
        adminMessageForm.addEventListener('submit', sendAdminMessage);
    }
});

// ============================================
// ADMIN BAN MANAGEMENT
// ============================================

function openBanModal(username) {
    state.tempBanUser = username;
    document.getElementById('banUserModal').classList.add('active');
}

function closeBanModal() {
    document.getElementById('banUserModal').classList.remove('active');
    state.tempBanUser = null;
}

function selectBanDuration(duration) {
    if (!state.tempBanUser) return;
    
    const until = duration === 'permanent' ? 'permanent' : Date.now() + duration;
    state.blockedUsers[state.tempBanUser] = until;
    saveBlockedUsers();
    
    closeBanModal();
    
    const durationText = duration === 'permanent' ? 'навсегда' : formatDuration(duration);
    showNotification('Пользователь ' + state.tempBanUser + ' заблокирован на ' + durationText);
    
    loadAdminUsers();
    loadAdminBans();
}

function adminBlockUser(username) {
    state.tempBanUser = username;
    openBanModal(username);
}

function clearChatHistory() {
    if (!state.activeChat) return;
    
    if (confirm('Очистить историю переписки с ' + state.activeChat + '?')) {
        state.messages = state.messages.filter(function(m) {
            return !((m.from === state.currentUser.name && m.to === state.activeChat) ||
                     (m.from === state.activeChat && m.to === state.currentUser.name));
        });
        saveMessages();
        loadMessages(state.activeChat);
        loadChats();
        showNotification('История очищена');
    }
}

// Сохранение сообщений
function saveMessages() {
    localStorage.setItem('openmessenger_messages', JSON.stringify(state.messages));
}

// Выход
function logout() {
    state.currentUser = null;
    localStorage.removeItem('openstore_user');
    showAuth();
}

// Профиль меню
function toggleProfileMenu() {
    document.getElementById('profileMenu').classList.toggle('active');
}

function openProfile() {
    document.getElementById('profileMenu').classList.remove('active');
    // Можно открыть профиль
}

// Поиск чатов
document.getElementById('chatSearch').addEventListener('input', function(e) {
    const search = e.target.value.toLowerCase();
    document.querySelectorAll('.chat-item').forEach(function(item) {
        const name = item.querySelector('.chat-item-name').textContent.toLowerCase();
        item.style.display = name.includes(search) ? 'flex' : 'none';
    });
});

// Утилиты
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'м назад';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'ч назад';
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function formatMessageTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(text, isError) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = text;
    notification.classList.toggle('error', isError || false);
    notification.classList.add('active');
    
    setTimeout(function() {
        notification.classList.remove('active');
    }, 3000);
}

function setupEventListeners() {
    // Вкладки авторизации
    document.querySelectorAll('.auth-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchAuth(this.dataset.tab);
        });
    });
    
    // Кнопка отправки сообщения
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // Кнопка прикрепления файла
    const attachBtn = document.getElementById('attachBtn');
    if (attachBtn) {
        attachBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
    
    // Закрытие меню профиля
    document.addEventListener('click', function(e) {
        const profile = document.querySelector('.user-profile');
        const menu = document.getElementById('profileMenu');
        if (profile && menu && !profile.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
    
    // Закрытие модальных окон по клику вне
    document.addEventListener('click', function(e) {
        const userProfileModal = document.getElementById('userProfileModal');
        const blockUserModal = document.getElementById('blockUserModal');
        
        if (userProfileModal && e.target === userProfileModal) {
            closeUserProfileModal();
        }
        if (blockUserModal && e.target === blockUserModal) {
            closeBlockModal();
        }
    });
}

// Глобальные функции
window.switchAuth = switchAuth;
window.sendMessage = sendMessage;
window.openChat = openChat;
window.logout = logout;
window.toggleProfileMenu = toggleProfileMenu;
window.openProfile = openProfile;
window.handleFileSelect = handleFileSelect;
window.viewUserProfile = viewUserProfile;
window.closeUserProfileModal = closeUserProfileModal;
window.sendMessageToUser = sendMessageToUser;
window.toggleBlockUser = toggleBlockUser;
window.closeBlockModal = closeBlockModal;
window.selectBlockDuration = selectBlockDuration;
window.clearChatHistory = clearChatHistory;
window.blockUserFromProfile = blockUserFromProfile;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.switchAdminTab = switchAdminTab;
window.openBanModal = openBanModal;
window.closeBanModal = closeBanModal;
window.selectBanDuration = selectBanDuration;
window.adminBlockUser = adminBlockUser;
window.adminUnblockUser = adminUnblockUser;
window.toggleMobileMenu = toggleMobileMenu;
