// Firebase конфигурация для синхронизации между устройствами
// Используем CDN версию для прямой работы в браузере

// Ждём загрузки Firebase
document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase ещё не загружен, ждём...');
        setTimeout(initFirebaseSync, 500);
    } else {
        initFirebaseSync();
    }
});

function initFirebaseSync() {
    // Инициализация Firebase
    firebase.initializeApp({
        apiKey: "AIzaSyBBdozFEHO2i9Fg4aHJnp657BlA0T-mvQ4",
        authDomain: "open-projects-b5f16.firebaseapp.com",
        projectId: "open-projects-b5f16",
        storageBucket: "open-projects-b5f16.firebasestorage.app",
        messagingSenderId: "236583473668",
        appId: "1:236583473668:web:810c759aa90e279b5f9b51",
        measurementId: "G-HK35D6DKL5"
    });
    
    const database = firebase.database();
    
    console.log('Firebase синхронизация запущена!');
    
    // Синхронизация пользователей
    function syncUsers() {
        const usersRef = database.ref('users');
        usersRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.state.users = Object.values(data);
                localStorage.setItem('openstore_all_users', JSON.stringify(window.state.users));
                if (typeof window.loadChats === 'function') window.loadChats();
                console.log('Пользователи синхронизированы:', window.state.users.length);
            }
        });
        
        const originalSaveUsers = window.saveUsers;
        window.saveUsers = function() {
            if (originalSaveUsers) originalSaveUsers();
            const usersObj = {};
            window.state.users.forEach(user => {
                usersObj[user.name] = user;
            });
            usersRef.set(usersObj);
        };
    }
    
    // Синхронизация сообщений
    function syncMessages() {
        const messagesRef = database.ref('messages');
        messagesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.state.messages = Object.values(data);
                localStorage.setItem('openmessenger_messages', JSON.stringify(window.state.messages));
                if (window.state.activeChat && typeof window.loadMessages === 'function') {
                    window.loadMessages(window.state.activeChat);
                }
                if (typeof window.loadChats === 'function') window.loadChats();
                console.log('Сообщения синхронизированы:', window.state.messages.length);
            }
        });
        
        const originalSaveMessages = window.saveMessages;
        window.saveMessages = function() {
            if (originalSaveMessages) originalSaveMessages();
            const messagesObj = {};
            window.state.messages.forEach(msg => {
                messagesObj[msg.id] = msg;
            });
            messagesRef.set(messagesObj);
        };
    }
    
    // Синхронизация блокировок
    function syncBlocks() {
        const blocksRef = database.ref('blocks');
        blocksRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.state.blockedUsers = data;
                localStorage.setItem('openmessenger_blocks', JSON.stringify(window.state.blockedUsers));
                console.log('Блокировки синхронизированы');
            }
        });
        
        const originalSaveBlockedUsers = window.saveBlockedUsers;
        window.saveBlockedUsers = function() {
            if (originalSaveBlockedUsers) originalSaveBlockedUsers();
            blocksRef.set(window.state.blockedUsers);
        };
    }
    
    // Синхронизация сообщений сайта
    function syncSiteMessages() {
        const messagesRef = database.ref('siteMessages');
        messagesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.state.siteMessages = Object.values(data);
                localStorage.setItem('openstore_messages', JSON.stringify(window.state.siteMessages));
                console.log('Сообщения сайта синхронизированы:', window.state.siteMessages.length);
            }
        });
        
        const originalSaveSiteMessages = window.saveSiteMessages;
        if (originalSaveSiteMessages) {
            window.saveSiteMessages = function() {
                originalSaveSiteMessages();
                const messagesObj = {};
                window.state.siteMessages.forEach(msg => {
                    messagesObj[msg.id] = msg;
                });
                messagesRef.set(messagesObj);
            };
        }
    }
    
    // Запуск синхронизации
    syncUsers();
    syncMessages();
    syncBlocks();
    syncSiteMessages();
}
