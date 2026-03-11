// Firebase синхронизация для Messenger
// Вызывается из app.js через startFirebaseSync()

var database = null;

function startFirebaseSync() {
    console.log('Firebase: Запуск синхронизации...');
    
    if (typeof window.state === 'undefined') {
        console.error('Firebase: window.state не определён!');
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
    
    database = firebase.database();
    console.log('✅ Firebase синхронизация запущена!');
    
    // ===== СИХРОНИЗАЦИЯ ПОЛЬЗОВАТЕЛЕЙ =====
    var usersRef = database.ref('users');
    
    usersRef.on('value', function(snapshot) {
        var data = snapshot.val();
        if (data) {
            window.state.users = Object.values(data);
            localStorage.setItem('openstore_all_users', JSON.stringify(window.state.users));
            console.log('👥 Пользователи синхронизированы:', window.state.users.length);
            if (typeof loadChats === 'function') loadChats();
        }
    });
    
    window.saveUsers = function() {
        localStorage.setItem('openstore_all_users', JSON.stringify(window.state.users));
        var usersObj = {};
        window.state.users.forEach(function(user) {
            usersObj[user.name] = user;
        });
        usersRef.set(usersObj);
    };
    
    // ===== СИХРОНИЗАЦИЯ СООБЩЕНИЙ =====
    var messagesRef = database.ref('messages');
    
    messagesRef.on('value', function(snapshot) {
        var data = snapshot.val();
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
        var messagesObj = {};
        window.state.messages.forEach(function(msg) {
            messagesObj[msg.id] = msg;
        });
        messagesRef.set(messagesObj);
    };
    
    // ===== СИХРОНИЗАЦИЯ БЛОКИРОВОК =====
    var blocksRef = database.ref('blocks');
    
    blocksRef.on('value', function(snapshot) {
        var data = snapshot.val();
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
    var siteMessagesRef = database.ref('siteMessages');
    
    siteMessagesRef.on('value', function(snapshot) {
        var data = snapshot.val();
        if (data) {
            window.state.siteMessages = Object.values(data);
            localStorage.setItem('openstore_messages', JSON.stringify(window.state.siteMessages));
            console.log('📢 Сообщения сайта синхронизированы:', window.state.siteMessages.length);
        }
    });
    
    window.saveSiteMessages = function() {
        localStorage.setItem('openstore_messages', JSON.stringify(window.state.siteMessages));
        var messagesObj = {};
        window.state.siteMessages.forEach(function(msg) {
            messagesObj[msg.id] = msg;
        });
        siteMessagesRef.set(messagesObj);
    };
    
    console.log('✅ Все обработчики синхронизации установлены');
}
