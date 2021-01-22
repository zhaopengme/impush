"use strict"
function makeid() {
  let t = "",
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 120; i++)
    t += e.charAt(Math.floor(Math.random() * e.length))
  return t
}
function clearMessage(t, clearEvent) {
  if (t.clearFlag && clearEvent == t.clearEvent) {
    let clearCondition = t.clearCondition
    let tag = t.tag
    let impressionTime = t.impressionTime
    if (!clearCondition || (!clearCondition.tag && !clearCondition.time)) {
      self.registration.getNotifications().then(function (notifications) {
        notifications.forEach(function (notification) {
          notification.close()
        })
      })
    } else if (clearCondition.tag && clearCondition.time) {
      let nHourBefore = impressionTime - clearCondition.time * 60 * 60 * 1000
      self.registration.getNotifications().then(function (notifications) {
        notifications.forEach(function (notification) {
          if (
            notification.data.tag == clearCondition.tag &&
            nHourBefore > notification.data.impressionTime
          ) {
            notification.close()
          }
        })
      })
    } else if (clearCondition.tag) {
      self.registration.getNotifications().then(function (notifications) {
        notifications.forEach(function (notification) {
          if (notification.data.tag == clearCondition.tag) {
            notification.close()
          }
        })
      })
    } else if (clearCondition.time) {
      let nHourBefore = impressionTime - clearCondition.time * 60 * 60 * 1000
      self.registration.getNotifications().then(function (notifications) {
        notifications.forEach(function (notification) {
          if (nHourBefore > notification.data.impressionTime) {
            notification.close()
          }
        })
      })
    }
  }
}
console.log(self);
self.addEventListener("install", function (t) {
  console.log('install');
  t.waitUntil(self.skipWaiting())
})
self.addEventListener("push", function (t) {
  const e = {
      timestamp: Math.floor(Date.now() / 1e3),
      type: "lp",
      uid: t.data ? t.data.text() : '{"cid":"push"}',
    },
    i = new FormData()
  i.append("json", JSON.stringify(e)),
    t.waitUntil(
      fetch("https://iypush.com/code/msg/", { method: "POST", body: i }).then(
        function (t) {
          if (200 !== t.status)
            throw (
              (console.log(
                "Looks like there was a problem. Status Code: " + t.status
              ),
              new Error())
            )
          return t
            .json()
            .then(function (t) {
              if (t.error || !t)
                throw (
                  (console.error("The API returned an error.", t.error),
                  new Error())
                )
              clearMessage(t, "impression")
              var options = {
                body: t.body,
                icon: t.icon,
                badge: t.badge,
                image: t.image,
                vibrate: t.vibrate,
                sound: t.sound,
                sticky: !0,
                noscreen: !1,
                requireInteraction: !0,
                timestamp: t.ts,
                actions: t.actions,
                data: {
                  url: t.url,
                  cid: t.cid,
                  cpc: t.cpc,
                  clearFlag: t.clearFlag,
                  clearEvent: t.clearEvent,
                  clearCondition: t.clearCondition,
                  tag: t.tag,
                  impressionTime: t.impressionTime,
                  clickPostbacks: t.clickPostbacks,
                  tracker: t.tracker,
                },
              }
              if (t.tag && t.tagClearFlag) {
                options["tag"] = t.tag
                options["renotify"] = true
              }
              if (t.links) {
                for (let i = 0; i < t.links.length; i++) {
                  fetch(t.links[i], { method: "GET", mode: "no-cors" })
                }
              }
              if (t.impPostbacks) {
                for (let i = 0; i < t.impPostbacks.length; i++) {
                  fetch(t.impPostbacks[i], { method: "GET", mode: "no-cors" })
                }
              }
              if (t.title)
                return self.registration.showNotification(t.title, options)
            })
            .catch(function (t) {
              console.error("Unable to retrieve data", t)
            })
        }
      )
    )
})
self.addEventListener("notificationclick", function (t) {
  let e = makeid(),
    i = t.notification.data.url.replace("{clid}", e)
  if (t.notification.data.clickPostbacks) {
    for (let i = 0; i < t.notification.data.clickPostbacks.length; i++) {
      fetch(t.notification.data.clickPostbacks[i], {
        method: "GET",
        mode: "no-cors",
      })
    }
  }
  const n = {
      timestamp: Math.floor(Date.now() / 1e3),
      type: "click",
      cid: t.notification.data.cid,
      clid: e,
      cpc: t.notification.data.cpc,
      tracker: t.notification.data.tracker,
    },
    o = new FormData()
  o.append("json", JSON.stringify(n)),
    fetch("https://iypush.com/code/pc/", { method: "POST", body: o })
  t.notification.close(),
    t.waitUntil(
      clients.matchAll({ type: "window" }).then(function (t) {
        if (clients.openWindow) return clients.openWindow(i || "/")
      })
    )
  clearMessage(t.notification.data, "click")
})
self.addEventListener("notificationclose", function (t) {
  clearMessage(t.notification.data, "close")
})
