// تطبيق MAPs: بيحفظ «الغلاف» (الصفحة والأيقونات) ليفتح بسرعة، وبيستقبل إشعارات الجوال.
const C = 'maps-shell-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'favicon.png'];

// كبسة على الإشعار: بيفتح التطبيق على الصفحة المطلوبة
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.indexOf(self.registration.scope) === 0 && 'focus' in w)
      return (w.navigate ? w.navigate(link) : Promise.resolve(w)).then(c => (c || w).focus()).catch(() => w.focus());
    return clients.openWindow(link);
  }));
});

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({ apiKey: "AIzaSyCTKWE4WxiYkRqp7XL6hh1ylBHfoeM1DDk", authDomain: "maps-it-70c0f.firebaseapp.com", projectId: "maps-it-70c0f",
  storageBucket: "maps-it-70c0f.firebasestorage.app", messagingSenderId: "545855133989", appId: "1:545855133989:web:592f89622728afcb1fe2cc" });
firebase.messaging().onBackgroundMessage(p => {
  const d = p.data || {};
  return self.registration.showNotification(d.title || 'MAPs', { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png',
    tag: d.tag || 'maps', renotify: true, data: { link: d.link || './' } });
});

self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
