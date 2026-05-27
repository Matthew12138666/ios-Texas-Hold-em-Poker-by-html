/**
 * Texas Hold'em Poker Pro — Service Worker 离线缓存抽水机
 * 策略：install 时全量预缓存核心资产 → 激活时清除旧版本 → fetch 时无条件回退本地缓存
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
   install — 全量预缓存
   ================================================================ */

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
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
   fetch — 网络拦截：优先缓存，离线 0 延迟秒开
   ================================================================ */

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(function (networkResponse) {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function () {
        return caches.match("index.html");
      });
    })
  );
});
