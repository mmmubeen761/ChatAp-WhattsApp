importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js');
var firebaseConfig = {
            apiKey: "AIzaSyCnu1spoqhRkSKUn9-tc-ZXK60EioE2M1s",
            authDomain: "ma-chatapp.firebaseapp.com",
            databaseURL: "https://ma-chatapp.firebaseio.com",
            projectId: "ma-chatapp",
            storageBucket: "ma-chatapp.appspot.com",
            messagingSenderId: "326979711514",
            appId: "1:326979711514:web:514ce3fb061bcd62ac57a3",
            measurementId: "G-81YCXP0WPQ"
        };
        firebase.initializeApp(firebaseConfig);
    

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'You have new message';
    const notificationOptions = {
      body: payload.data.message,
      icon: '/firebase-logo.png'
    };
  
    return self.registration.showNotification(notificationTitle,
      notificationOptions);
  });