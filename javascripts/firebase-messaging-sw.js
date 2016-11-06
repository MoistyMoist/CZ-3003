// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '455786633696'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  var msg_body = ""
  if (incident !== undefined && incident) {
	  msg_body = "New Incident reported";
  }
  
  if (incident_logs !== undefined && inident_logs) {
	  msg_body = "New Log Added"  
  }
  
  // Customize notification here
  const notificationTitle = 'Crisis SG';
  const notificationOptions = {
    body: msg_body,
    icon: '../images/logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [END background_handler]