console.log('Started', self);

self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Installed', event);
});

self.addEventListener('activate', function(event) {
  console.log('Activated', event);
});

self.addEventListener('push', function(event) {
  console.log('Push message received', event);
  console.log(event.data.json());
  
  var title = 'Push message';
  
  event.waitUntil(self.registration.showNotification(title, {
	  body: 'The Message',
	  icon: 'images/icon.png',
	  tag: 'my-tag'
  }));
});