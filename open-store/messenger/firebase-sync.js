// Firebase синхронизация для Messenger
// Запускается ПОСЛЕ app.js

// Ждём 1.5 секунды пока app.js инициализирует state
setTimeout(function() {
    console.log('Firebase: Проверяю state...');
    
    if (typeof window.state === 'undefined') {
        console.log('Firebase: state не готов, жду ещё...');
        setTimeout(initFirebase, 500);
        return;
    }
    
    initFirebase();
    
}, 1500);

function initFirebase() {
    if (typeof window.state === 'undefined') {
        console.error('Firebase: state так и не определился!');
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
    console.log('✅ Firebase синхронизация запущена!');
    
    // ===== СИХРОНИЗАЦИЯ ПОЛЬЗОВАТЕЛЕЙ =====
    const usersRef = database.ref('users');
    
    // Загрузка из Firebase
    usersRef.on('value', function(snapshot) {
        const data = snapshot.val();
        if (data) {
            window.state.users = Object.values(data);
            localStorage.setItem('openstore_all_users', JSON.stringify(window.state.users));
            console.log('👥 Пользователи синхронизированы:', window.state.users.length);
            if (typeof loadChats === 'function') loadChats();
        }
    });
    
    // Сохранение в Firebase
    window.saveUsers = function() {
        localStorage.setItem('openstore_all_users', JSON.stringify(window.state.users));
        const usersObj = {};
        window.state.users.forEach(function(user) {
            usersObj[user.name] = user;
        });
        usersRef.set(usersObj);
    };
    
    // ===== СИХРОНИЗАЦИЯ СООБЩЕНИЙ =====
    const messagesRef = database.ref('messages');
    
    messagesRef.on('value', function(snapshot) {
        const data = snapshot.val();
        if (data) {
            window.state.messages = Object.values(data);
            localStorage.setItem('openmessenger_messages', JSON.stringify(window.state.messages));
            console.log('💬 Сообщения синхронизированы:', window.state.messages.length);
            if (window.state.activeChat && typeof loadMessages === 'function') {
                loadMessages(window.state.activeChat);
            }
            if (typeof loadChats === 'function') loadChats();
        }
    });
    
    window.saveMessages = function() {
        localStorage.setItem('openmessenger_messages', JSON.stringify(window.state.messages));
        const messagesObj = {};
        window.state.messages.forEach(function(msg) {
            messagesObj[msg.id] = msg;
        });
        messagesRef.set(messagesObj);
    };
    
    // ===== СИХРОНИЗАЦИЯ БЛОКИРОВОК =====
    const blocksRef = database.ref('blocks');
    
    blocksRef.on('value', function(snapshot) {
        const data = snapshot.val();
        if (data !== null) {
            window.state.blockedUsers = data;
            localStorage.setItem('openmessenger_blocks', JSON.stringify(window.state.blockedUsers));
            console.log('🚫 Блокировки синхронизированы');
        }
    });
    
    window.saveBlockedUsers = function() {
        localStorage.setItem('openmessenger_blocks', JSON.stringify(window.state.blockedUsers));
        blocksRef.set(window.state.blockedUsers);
    };
    
    // ===== СИХРОНИЗАЦИЯ СООБЩЕНИЙ САЙТА =====
    const siteMessagesRef = database.ref('siteMessages');
    
    siteMessagesRef.on('value', function(snapshot) {
        const data = snapshot.val();
        if (data) {
            window.state.siteMessages = Object.values(data);
            localStorage.setItem('openstore_messages', JSON.stringify(window.state.siteMessages));
            console.log('📢 Сообщения сайта синхронизированы:', window.state.siteMessages.length);
        }
    });
    
    window.saveSiteMessages = function() {
        localStorage.setItem('openstore_messages', JSON.stringify(window.state.siteMessages));
        const messagesObj = {};
        window.state.siteMessages.forEach(function(msg) {
            messagesObj[msg.id] = msg;
        });
        siteMessagesRef.set(messagesObj);
    };
}
