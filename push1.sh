var idbKeyval = (function(e) {
  'use strict';
  class t {
    constructor(e = 'keyval-store', t = 'keyval') {
      (this.storeName = t),
        (this._dbp = new Promise((r, n) => {
          const o = indexedDB.open(e, 1);
          (o.onerror = () => n(o.error)),
            (o.onsuccess = () => r(o.result)),
            (o.onupgradeneeded = () => {
              o.result.createObjectStore(t);
            });
        }));
    }
    _withIDBStore(e, t) {
      return this._dbp.then(
        r =>
          new Promise((n, o) => {
            const s = r.transaction(this.storeName, e);
            (s.oncomplete = () => n()),
              (s.onabort = s.onerror = () => o(s.error)),
              t(s.objectStore(this.storeName));
          })
      );
    }
  }
  let r;
  function n() {
    return r || (r = new t()), r;
  }
  return (
    (e.Store = t),
    (e.get = function(e, t = n()) {
      let r;
      return t
        ._withIDBStore('readonly', t => {
          r = t.get(e);
        })
        .then(() => r.result);
    }),
    (e.set = function(e, t, r = n()) {
      return r._withIDBStore('readwrite', r => {
        r.put(t, e);
      });
    }),
    (e.del = function(e, t = n()) {
      return t._withIDBStore('readwrite', t => {
        t.delete(e);
      });
    }),
    (e.clear = function(e = n()) {
      return e._withIDBStore('readwrite', e => {
        e.clear();
      });
    }),
    (e.keys = function(e = n()) {
      const t = [];
      return e
        ._withIDBStore('readonly', e => {
          (e.openKeyCursor || e.openCursor).call(e).onsuccess = function() {
            this.result && (t.push(this.result.key), this.result.continue());
          };
        })
        .then(() => t);
    }),
    e
  );
})({});


function isBlank(v) {
  return v === undefined || v === null || v.length === 0;
}

function setCookie(c_name, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
  var i, x, y, ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++) {
      x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
      y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
      x = x.replace(/^\s+|\s+$/g, "");
      if (x == c_name) {
          return unescape(y);
      }
  }
}

function getParam(key) {
  var url_string = window.top.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get(key);
  return c;
}

var utm_source = getParam('utm_source');
if (isBlank(utm_source)) {
  utm_source = getCookie();
} else {
  setCookie('utm_source',utm_source,999)
}

var hashKey =
  'BDhUAzckW8uraLvGsXCSxqpG086DCBjp3TMZ8tSVUK1ywTnFL8GjHYq0SxjyyoZAeEFtPk2wyBmDp2NwyvhNpBI';
var Push = {
  init: function(e) {
    localStorage.getItem('MegaToken') || Push.subscribe(e);
  },
  install: function(e) {
    navigator.serviceWorker.register('/sw.js?rev=3').then(
      () => {
        e.granted(), Push.push_updateSubscription(e);
      },
      n => {
        e.denied();
      }
    );
  },
  subscribe: function(e) {
    'click' === e.type
      ? e.button
        ? (document.getElementById(e.button).onclick = function() {
            Push.push_subscribe(e);
          })
        : (document.getElementsByTagName('body')[0].onclick = function() {
            Push.push_subscribe(e);
          })
      : 'over' === e.type
      ? e.button
        ? (document.getElementById(e.button).onmouseover = function() {
            Push.push_subscribe(e);
          })
        : (document.getElementsByTagName('body')[0].onmouseover = function() {
            Push.push_subscribe(e);
          })
      : Push.push_subscribe(e);
  },
  generateToken: function() {
    if (localStorage.getItem('MegaToken'))
      return localStorage.getItem('MegaToken');
    {
      let e = Math.floor(88888888888 * Math.random() + 11111111111);
      return (
        idbKeyval.set('MegaToken', e), localStorage.setItem('MegaToken', e), e
      );
    }
  },
  urlBase64ToUint8Array: function(e) {
    const n = (e + '='.repeat((4 - (e.length % 4)) % 4))
        .replace(/\-/g, '+')
        .replace(/_/g, '/'),
      t = window.atob(n),
      r = new Uint8Array(t.length);
    for (let e = 0; e < t.length; ++e) r[e] = t.charCodeAt(e);
    return r;
  },
  push_subscribe: function(e) {
    Notification.requestPermission().then(function(n) {
      'granted' === n
        ? (Push.install(e),
          localStorage.setItem('MegaPid', e.pid),
          navigator.serviceWorker.ready
            .then(e =>
              e.pushManager.subscribe({
                userVisibleOnly: !0,
                applicationServerKey: Push.urlBase64ToUint8Array(hashKey),
              })
            )
            .then(n => Push.push_sendSubscriptionToServer(n, 'POST', e, 'new'))
            .then(e => e)
            .catch(e => {
              'denied' === Notification.permission
                ? console.warn('Notifications are denied by the user.')
                : console.error(
                    'Impossible to subscribe to push notifications',
                    e
                  );
            }))
        : e.denied();
    });
  },
  push_updateSubscription: function(e) {
    navigator.serviceWorker.ready
      .then(e => e.pushManager.getSubscription())
      .then(n => {
        if (n)
          return Push.push_sendSubscriptionToServer(n, 'POST', e.pid, 'update');
      })
      .then(e => e)
      .catch(e => {
        console.error('Error when updating the subscription', e);
      });
  },
  push_sendSubscriptionToServer: function(e, n, t, r) {
    const o = e.getKey('p256dh'),
      i = e.getKey('auth'),
      u = new Date().getTimezoneOffset();
    return fetch('https://api.newpush.today/code/subscribe/', {
      method: n,
      credentials: 'include',
      body: JSON.stringify({
        utm_source:utm_source,
        uid: Push.generateToken() + '',
        endpoint: e.endpoint,
        expirationTime: null,
        subscribedDomain: window.location.host,
        keys: {
          p256dh: o
            ? btoa(String.fromCharCode.apply(null, new Uint8Array(o)))
            : null,
          auth: i
            ? btoa(String.fromCharCode.apply(null, new Uint8Array(i)))
            : null,
        },
      }),
    })
      .then(() => e)
      .then(function() {
        t.subscribed();
      });
  },
};
Push.init({
  pid: 2,
  type: 'auto',
  button: 'testbtn',
  granted: function() {},
  denied: function() {},
  subscribed: function() {},
});
