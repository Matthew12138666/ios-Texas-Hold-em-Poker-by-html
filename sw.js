/**
 * Texas Hold'em Poker Pro — Service Worker 离线缓存抽水机
 * iOS Safari 兼容版：逐个文件容错缓存 + fetch 按请求类型分流回退
 */

"use strict";

var CACHE_NAME = "texas-holdem-v4";

var STATIC_ASSETS = [
  "index.html",
  "style.css",
  "game.js",
  "ai-engine.js",
  "settings.js",
  "manifest.json"
];

/* ================================================================
   install — 逐个 fetch → cache.put，容错不中断
   ================================================================ */

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      var cachePromises = STATIC_ASSETS.map(function (url) {
        return fetch(url, { credentials: "same-origin" }).then(function (response) {
          if (response && response.status === 200) {
            return cache.put(url, response);
          }
        }).catch(function () {
          /* 单个文件失败不影响其余文件 */
        });
      });
      return Promise.all(cachePromises);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ================================================================
   activate — 清理旧版本缓存
   ================================================================ */

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ================================================================
   fetch — 缓存优先：缓存命中直接返回 → 网络获取并缓存 → 离线兜底
   ================================================================ */

self.addEventListener("fetch", function (event) {
  var requestUrl = event.request.url;

  /* 只处理同源请求，跨域请求（如 chrome-extension://）直接透传 */
  var origin = self.location.origin;
  if (requestUrl.indexOf(origin) !== 0) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      /* 缓存命中：直接返回，0 延迟 */
      if (cachedResponse) {
        return cachedResponse;
      }

      /* 缓存未命中：尝试网络请求 */
      return fetch(event.request, { credentials: "same-origin" }).then(function (networkResponse) {
        /* 成功的同源响应写入缓存 */
        if (networkResponse && networkResponse.status === 200) {
          var cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, cloned);
          });
        }
        return networkResponse;
      }).catch(function () {
        /* 网络彻底断开时的兜底 */
        /* 对导航请求（HTML 页面）回退到缓存的 index.html */
        if (event.request.mode === "navigate") {
          return caches.match("index.html");
        }
        /* 非导航请求（CSS/JS/图片等）：返回简单的离线响应 */
        return new Response("", { status: 503, statusText: "Offline" });
      });
    })
  );
});
