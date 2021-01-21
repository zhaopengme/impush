var idbKeyval = (function (e) {
  "use strict"
  class t {
    constructor(e = "keyval-store", t = "keyval") {
      ;(this.storeName = t),
        (this._dbp = new Promise((r, n) => {
          const o = indexedDB.open(e, 1)
          ;(o.onerror = () => n(o.error)),
            (o.onsuccess = () => r(o.result)),
            (o.onupgradeneeded = () => {
              o.result.createObjectStore(t)
            })
        }))
    }
    _withIDBStore(e, t) {
      return this._dbp.then(
        (r) =>
          new Promise((n, o) => {
            const s = r.transaction(this.storeName, e)
            ;(s.oncomplete = () => n()),
              (s.onabort = s.onerror = () => o(s.error)),
              t(s.objectStore(this.storeName))
          })
      )
    }
  }
  let r
  function n() {
    return r || (r = new t()), r
  }
  return (
    (e.Store = t),
    (e.get = function (e, t = n()) {
      let r
      return t
        ._withIDBStore("readonly", (t) => {
          r = t.get(e)
        })
        .then(() => r.result)
    }),
    (e.set = function (e, t, r = n()) {
      return r._withIDBStore("readwrite", (r) => {
        r.put(t, e)
      })
    }),
    (e.del = function (e, t = n()) {
      return t._withIDBStore("readwrite", (t) => {
        t.delete(e)
      })
    }),
    (e.clear = function (e = n()) {
      return e._withIDBStore("readwrite", (e) => {
        e.clear()
      })
    }),
    (e.keys = function (e = n()) {
      const t = []
      return e
        ._withIDBStore("readonly", (e) => {
          ;(e.openKeyCursor || e.openCursor).call(e).onsuccess = function () {
            this.result && (t.push(this.result.key), this.result.continue())
          }
        })
        .then(() => t)
    }),
    e
  )
})({})

function isBlank(v) {
  return v === undefined || v === null || v.length === 0
}

function setCookie(c_name, value, exdays) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + exdays)
  var c_value =
    escape(value) + (exdays == null ? "" : "; expires=" + exdate.toUTCString())
  document.cookie = c_name + "=" + c_value
}

function getCookie(c_name) {
  var i,
    x,
    y,
    ARRcookies = document.cookie.split(";")
  for (i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="))
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1)
    x = x.replace(/^\s+|\s+$/g, "")
    if (x == c_name) {
      return unescape(y)
    }
  }
}

function getParam(key) {
  var url_string = window.top.location.href
  var url = new URL(url_string)
  var c = url.searchParams.get(key)
  return c
}

var utm_source = getParam("utm_source")
if (isBlank(utm_source)) {
  utm_source = getCookie()
} else {
  setCookie("utm_source", utm_source, 999)
}

var hashKey =
  "BDhUAzckW8uraLvGsXCSxqpG086DCBjp3TMZ8tSVUK1ywTnFL8GjHYq0SxjyyoZAeEFtPk2wyBmDp2NwyvhNpBI"

var Push = {
  init: function (params) {
    localStorage.getItem("MegaToken") || Push.subscribe(params)
  },
  ga: function (event, eventParams) {
    if (!eventParams) {
      eventParams = {}
    }
    if (window.gtag) {
      gtag("event", event, eventParams)
    }
  },
  install: function (params) {
    navigator.serviceWorker.register("/sw.js?rev=3").then(
      () => {
        params.granted()
        Push.push_updateSubscription(params)
      },
      () => {
        Push.ga("denied")
        params.denied()
      }
    )
  },
  subscribe: function (params) {
    if (params.type == "click") {
      if (params.button) {
        document.getElementById(params.button).onclick = function () {
          Push.push_subscribe(params)
        }
      } else {
        document.getElementsByTagName("body")[0].onclick = function () {
          Push.push_subscribe(params)
        }
      }
    } else if (params.type == "over") {
      if (params.button) {
        document.getElementById(params.button).onmouseover = function () {
          Push.push_subscribe(params)
        }
      } else {
        document.getElementsByTagName("body")[0].onmouseover = function () {
          Push.push_subscribe(params)
        }
      }
    } else {
      Push.push_subscribe(params)
    }
  },
  generateToken: function () {
    if (localStorage.getItem("MegaToken")) {
      return localStorage.getItem("MegaToken")
    }
    var token = Math.floor(88888888888 * Math.random() + 11111111111)
    idbKeyval.set("MegaToken", token)
    localStorage.setItem("MegaToken", token)
    return token
  },
  urlBase64ToUint8Array: function (e) {
    alert('urlBase64ToUint8Array');
    const n = (e + "=".repeat((4 - (e.length % 4)) % 4))
        .replace(/\-/g, "+")
        .replace(/_/g, "/"),
      t = window.atob(n),
      r = new Uint8Array(t.length)
    for (let e = 0; e < t.length; ++e) r[e] = t.charCodeAt(e)
    return r
  },
  push_subscribe: function (params) {
    alert('push_subscribe');

    Notification.requestPermission().then((permission) => {
      alert('push_subscribe'+permission);

      if (permission == "granted") {
        Push.install(params)
        localStorage.setItem("MegaPid", params.pid)
        navigator.serviceWorker.ready.then((registration) => {
          alert('serviceWorker');

          registration.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: Push.urlBase64ToUint8Array(hashKey),
            })
            .then((pushSubscription) => {
              alert('pushSubscription');

              Push.push_sendSubscriptionToServer(
                pushSubscription,
                "POST",
                params,
                "new"
              )
              Push.ga("subscribed_ok")
            })
            .catch((err) => {
              alert('subscribe_error');
              alert(err);
              Push.ga("subscribe_error")
              console.warn(err)
            })
        })
      } else {
        Push.ga("denied")
        params.denied()
      }
    })
  },
  push_updateSubscription: function (params) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.pushManager.getSubscription()
      })
      .then((pushSubscription) => {
        Push.push_sendSubscriptionToServer(
          pushSubscription,
          "POST",
          params,
          "update"
        )
        Push.ga("subscribed_update")
      })
      .catch((err) => {
        Push.ga("subscribe_update_error")
        console.warn(err)
      })
  },
  push_sendSubscriptionToServer: function (
    pushSubscription,
    method,
    params,
    subscribeType
  ) {
    var p256dh = pushSubscription.getKey("p256dh")
    if (p256dh) {
      p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh)))
    }
    var auth = pushSubscription.getKey("auth")
    if (auth) {
      auth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)))
    }
    alert('push_sendSubscriptionToServer');

    fetch("https://api.newpush.today/code/subscribe/", {
      method: method,
      credentials: "include",
      body: JSON.stringify({
        utm_source: utm_source,
        pid: params.pid,
        subscribeType: subscribeType,
        uid: Push.generateToken() + "",
        endpoint: pushSubscription.endpoint,
        expirationTime: null,
        subscribedDomain: window.location.host,
        keys: {
          p256dh: p256dh,
          auth: auth,
        },
      }),
    }).then(() => {
      alert('ok');

      params.subscribed()
    })
  },
}

var storage = (function (win) {
  var StorageKeys = {},
    regStorageKey = /^localstorage\_\_\_(.*)+\_\_\_\d*$/,
    prefixText = "localstorage",
    space = "___"

  function getRealKey(key) {
    var tempArr = key.split(space),
      realKey = {}

    realKey["realkey"] = tempArr[1]
    realKey["expires"] = tempArr[2] || ""

    return realKey
  }

  function isExpires(key, expires) {
    var now = +new Date()

    if (!expires) {
      return false
    }

    if (now > parseInt(expires, 10)) {
      return true
    }

    return false
  }

  function clear() {
    for (var key in win.localStorage) {
      if (regStorageKey.test(key)) {
        win.localStorage.removeItem(key)
      }
    }
    return this
  }

  function removeItem(key) {
    var item = StorageKeys[key]
    if (item) {
      win.localStorage.removeItem(item["key"])
    }
    return this
  }

  function getItem(key) {
    var item = StorageKeys[key]
    if (item) {
      // 如果过期了，那么就返回空字符串
      if (isExpires(key, item["expires"])) {
        return ""
      }
      return win.localStorage[item["key"]]
    }
    return ""
  }

  function setItem(key, value, expires) {
    if (!key) {
      return this
    }

    expires = expires || 0

    this._key = key
    var now = +new Date(),
      localKey =
        prefixText + space + key + space + (expires ? expires * 1000 + now : "")

    win.localStorage.setItem(localKey, value)
    StorageKeys[key] = {
      key: localKey,
      expires: expires ? expires * 1000 + now : "",
    }

    return this
  }

  function expires(seconds) {
    if (!seconds) {
      return this
    }

    var key = this._key,
      item = StorageKeys[key] || {},
      value = win.localStorage[item["key"]],
      now = +new Date()

    if (!key) {
      return this
    }

    this.removeItem(key)
    this.setItem(key, value, seconds)

    return this
  }

  function initCheck() {
    var realKey
    for (var key in win.localStorage) {
      if (regStorageKey.test(key)) {
        realKey = getRealKey(key)

        // 如果已经过期的local data，则删掉
        if (isExpires(realKey["realkey"], realKey["expires"])) {
          win.localStorage.removeItem(key)
          continue
        }

        StorageKeys[realKey["realkey"]] = {
          key: key,
          expires: realKey["expires"],
        }
      }
    }
  }

  // 立即检查localStorage过期情况
  initCheck()

  return {
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    expires: expires,
  }
})(window)

var Layer = {
  create: function (options) {
    var html =
      '<div class="layer-shade"></div> <div class="layui-layer layui-layer-dialog"> <div class="layui-layer-content"> <div> <div class="layui-layer-close"> <img src="./close.png" alt=""> </div> <div id="subscribe-button">' +
      options.content +
      "</div> </div> </div> </div><style> .layer-shade{ top: 0; left: 0; width: 100%; height: 100%; position: fixed; z-index: 2258594000; background-color: rgb(0, 0, 0); opacity: 0.3; } .layui-layer{ top: 0; left: 0; width: 100%; height: 100%; position: fixed; z-index: 2258594001; } .layui-layer-content{ display: flex; height: 100%; justify-content: center; align-items: center; padding: 0.5em; } .layui-layer-close{ float:right; } </style>"
    var div = document.createElement("div")
    div.id = "layer-id"
    div.innerHTML = html
    document.body.appendChild(div)
  },
  listener: function (options) {
    setTimeout(function () {
      document.querySelector(".layui-layer-close").onclick = function (e) {
        e.stopPropagation()
        if (document.querySelector("#layer-id")) {
          document.querySelector("#layer-id").remove()
        }
        if (options.close) {
          options.close()
        }
      }
      document.querySelector(".layui-layer-content").onclick = function (e) {
        e.stopPropagation()
        if (document.querySelector("#layer-id")) {
          document.querySelector("#layer-id").remove()
        }
        if (options.ok) {
          options.ok()
        }
      }
    }, 50)
  },
  open: function (options) {
    Layer.create(options)
    Layer.listener(options)
  },
}

function _init() {
  var contents = [
    '<img src="./2.png" alt="" style="width:100%;height:auto;">',
    '<img src="./1.png" alt="" style="width:100%;height:auto;">',
  ]
  var options = {
    content: contents[Math.floor(Math.random() * contents.length)],
    ok: function () {
      Push.init({
        pid: 2,
        type: "",
        button: "subscribe-button",
        granted: function () {
          localStorage.setItem("subscribe-push", "true")
        },
        denied: function () {
          storage.setItem("deniedsubscribed", "true")
        },
        subscribed: function () {
          localStorage.setItem("subscribed", "true")
        },
      })
    },
    close: function () {
      storage.setItem("nosubscribed", "true").expires(10)
    },
  }

  var subscribed = storage.getItem("subscribed")

  if (subscribed == "true") {
    return
  }

  var nosubscribed = storage.getItem("nosubscribed")

  if (nosubscribed) {
    return
  }
  var deniedsubscribed = storage.getItem("deniedsubscribed")

  if (deniedsubscribed) {
    return
  }

  Layer.open(options)
}
_init()

