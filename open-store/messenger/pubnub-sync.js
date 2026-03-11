// PubNub синхронизация для Messenger
// Бесплатно до 100 устройств

// Конфигурация PubNub
const PUBNUB_CONFIG = {
    publishKey: 'demo',      // Замените на свои ключи
    subscribeKey: 'demo'     // Получите на https://www.pubnub.com/
};

// Инициализация PubNub
const pubnub = new PubNub({
    publishKey: PUBNUB_CONFIG.publishKey,
    subscribeKey: PUBNUB_CONFIG.subscribeKey
});

// Каналы для синхронизации
const CHANNELS = {
    USERS: 'open-messenger-users',
    MESSAGES: 'open-messenger-messages',
    BLOCKS: 'open-messenger-blocks'
};

// Синхронизация пользователей
function syncUsers() {
    // Подписка на обновления
    pubnub.subscribe({
        channels: [CHANNELS.USERS]
    });
    
    pubnub.addListener({
        message: function(event) {
            if (event.channel === CHANNELS.USERS) {
                state.users = event.message;
                localStorage.setItem('openstore_all_users', JSON.stringify(state.users));
                loadChats();
            }
            if (event.channel === CHANNELS.MESSAGES) {
                state.messages = event.message;
                localStorage.setItem('openmessenger_messages', JSON.stringify(state.messages));
                if (state.activeChat) loadMessages(state.activeChat);
                loadChats();
            }
            if (event.channel === CHANNELS.BLOCKS) {
                state.blockedUsers = event.message;
                localStorage.setItem('openmessenger_blocks', JSON.stringify(state.blockedUsers));
            }
        }
    });
}

// Публикация обновлений
function publishUpdate(channel, data) {
    pubnub.publish({
        channel: channel,
        message: data
    });
}

// Переопределение функций сохранения
const originalSaveUsers = saveUsers;
saveUsers = function() {
    originalSaveUsers();
    publishUpdate(CHANNELS.USERS, state.users);
};

const originalSaveMessages = saveMessages;
saveMessages = function() {
    originalSaveMessages();
    publishUpdate(CHANNELS.MESSAGES, state.messages);
};

const originalSaveBlockedUsers = saveBlockedUsers;
saveBlockedUsers = function() {
    originalSaveBlockedUsers();
    publishUpdate(CHANNELS.BLOCKS, state.blockedUsers);
};

// Запуск синхронизации
document.addEventListener('DOMContentLoaded', function() {
    syncUsers();
});
