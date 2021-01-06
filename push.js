
var hashKey = "BDhUAzckW8uraLvGsXCSxqpG086DCBjp3TMZ8tSVUK1ywTnFL8GjHYq0SxjyyoZAeEFtPk2wyBmDp2NwyvhNpBI";

var Push = {
    getParam: function (e, a) {
        return void 0 === a && (a = ""),
            decodeURIComponent((new RegExp("[?|&]" + e + "=([^&;]+?)(&|#|;|$)").exec(location.search) || [a, ""])[1].replace(/\+/g, "%20")) || a
    },
    init: function (e) {
        localStorage.getItem("MegaToken") || Push.subscribe(e)
    }, install: function (e) {
        navigator.serviceWorker.register("/sw.js?rev=3").then(() => {
            e.granted(), Push.push_updateSubscription(e)
        }, n => {
            e.denied()
        })
    }, subscribe: function (e) {
        "click" === e.type ? e.button ? document.getElementById(e.button).onclick = function () {
            Push.push_subscribe(e)
        } : document.getElementsByTagName("body")[0].onclick = function () {
            Push.push_subscribe(e)
        } : "over" === e.type ? e.button ? document.getElementById(e.button).onmouseover = function () {
            Push.push_subscribe(e)
        } : document.getElementsByTagName("body")[0].onmouseover = function () {
            Push.push_subscribe(e)
        } : Push.push_subscribe(e)
    }, generateToken: function () {
        if (localStorage.getItem("MegaToken")) return localStorage.getItem("MegaToken");
        {
            let e = Math.floor(88888888888 * Math.random() + 11111111111);
            return idbKeyval.set("MegaToken", e), localStorage.setItem("MegaToken", e), e
        }
    }, urlBase64ToUint8Array: function (e) {
        const n = (e + "=".repeat((4 - e.length % 4) % 4)).replace(/\-/g, "+").replace(/_/g, "/"), t = window.atob(n), r = new Uint8Array(t.length);
        for (let e = 0; e < t.length; ++e) r[e] = t.charCodeAt(e);
        return r
    }, push_subscribe: function (e) {
        Notification.requestPermission().then(function (n) {
            "granted" === n ? (Push.install(e), localStorage.setItem("MegaPid", e.pid), navigator.serviceWorker.ready.then(e => e.pushManager.subscribe({ userVisibleOnly: !0, applicationServerKey: Push.urlBase64ToUint8Array(hashKey) })).then(n => Push.push_sendSubscriptionToServer(n, "POST", e, "new")).then(e => e).catch(e => {
                "denied" === Notification.permission ? console.warn("Notifications are denied by the user.") : console.error("Impossible to subscribe to push notifications", e)
            })) : e.denied()
        })
    }, push_updateSubscription: function (e) {
        navigator.serviceWorker.ready.then(e => e.pushManager.getSubscription()).then(n => {
            if (n) return Push.push_sendSubscriptionToServer(n, "POST", e.pid, "update")
        }).then(e => e).catch(e => {
            console.error("Error when updating the subscription", e)
        })
    }, push_sendSubscriptionToServer: function (e, n, t, r) {
        const o = e.getKey("p256dh"), i = e.getKey("auth"), u = (new Date).getTimezoneOffset();
        return fetch("https://iypush.com/code/subscribe/", {
            method: n,
            body: JSON.stringify({
		uid: Push.generateToken(),
                endpoint: e.endpoint,
                expirationTime:null,
                subscribedDomain: window.location.host,
                keys: {
                    p256dh: o ? btoa(String.fromCharCode.apply(null, new Uint8Array(o))) : null,
                    auth: i ? btoa(String.fromCharCode.apply(null, new Uint8Array(i))) : null,
                },
            })
        }).then(() => e).then(function () {
            t.subscribed();
        })
    }
};



Push.init({
    pid: 2, type: 'auto', button: 'testbtn', granted: function () {

    }, denied: function () {

    }, subscribed: function () {

    }
});
