// Open Messenger - Интеграция с Open Store

const OPEN_STORE_PATH = '../open-store/app.js';

let state = {
    currentUser: null,
    users: [],
    chats: [],
    messages: [],
    activeChat: null,
    blockedUsers: {}, // { username: blockUntilTimestamp }
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
    const otherUsers = state.users.filter(u => u.name !== state.currentUser.name);
    
    if (otherUsers.length === 0) {
        chatList.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">Нет других пользователей</p>';
        return;
    }
    
    chatList.innerHTML = otherUsers.map(function(user) {
        // Получаем последние сообщения
        const userMessages = state.messages.filter(function(m) {
            return (m.from === state.currentUser.name && m.to === user.name) ||
                   (m.from === user.name && m.to === state.currentUser.name);
        });
        
        const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
        const unreadCount = userMessages.filter(function(m) {
            return m.to === state.currentUser.name && !m.read;
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
