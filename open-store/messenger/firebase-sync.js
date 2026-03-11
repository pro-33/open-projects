// Firebase конфигурация для синхронизации между устройствами
// Используем CDN версию для прямой работы в браузере

// Запускаем синхронизацию после загрузки app.js
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initFirebaseSync, 500);
});

function initFirebaseSync() {
    // Проверяем что state существует
    if (typeof window.state === 'undefined') {
        console.log('state ещё не определён, ждём...');
        setTimeout(initFirebaseSync, 500);
        return;
    }
    
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
        
        window.saveUsers = function() {
            localStorage.setItem('openstore_all_users', JSON.stringify(window.state.users));
            const usersObj = {};
            window.state.users.forEach(user => {
                usersObj[user.name] = user;
            });
            database.ref('users').set(usersObj);
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
        
        window.saveMessages = function() {
            localStorage.setItem('openmessenger_messages', JSON.stringify(window.state.messages));
            const messagesObj = {};
            window.state.messages.forEach(msg => {
                messagesObj[msg.id] = msg;
            });
            database.ref('messages').set(messagesObj);
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
        
        window.saveBlockedUsers = function() {
            localStorage.setItem('openmessenger_blocks', JSON.stringify(window.state.blockedUsers));
            database.ref('blocks').set(window.state.blockedUsers);
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
        
        window.saveSiteMessages = function() {
            localStorage.setItem('openstore_messages', JSON.stringify(window.state.siteMessages));
            const messagesObj = {};
            window.state.siteMessages.forEach(msg => {
                messagesObj[msg.id] = msg;
            });
            database.ref('siteMessages').set(messagesObj);
        };
    }
    
    // Запуск синхронизации
    syncUsers();
    syncMessages();
    syncBlocks();
    syncSiteMessages();
}
