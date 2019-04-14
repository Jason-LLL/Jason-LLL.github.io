importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js");
var cacheStorageKey = 'minimal-pwa-1'
var cacheList=[
 '/',
 'index.html',
 'main.css',
 'youhun.png'
]
//浏览器解析完sw后 serviceworker触发内部的install事件
self.addEventListener('install',e =>{
    console.log('Cache 事件');
    // 在installed之前 缓存资源 
 e.waitUntil(
 caches.open(cacheStorageKey)
 .then(cache => cache.addAll(cacheList))  //返回一个promise来等待资源缓存成功
 .then(() => self.skipWaiting()) //  skipWaiting 可以使得刚刚变成installed状态的serviceworker 立马进入Activating状态 ，子线程会触发activate事件
 )
})

self.addEventListener('activate',function(e){
    console.log('promise all',Promise,Promise.all);

     // active事件中通常做一些过期资源释放的工作
    // var cacheDeletePromises = caches.keys().then(cacheNames=>{
    //     console.log('cacheName',cacheNames,cacheNames.map);
    //     return Promise.all(cacheNames.map(name=>{
    //         if(name!== cacheStorageKey){
    //             console.log('caches delete',caches.delete);
    //             var deletePromise = caches.delete(name);
    //             console.log('cache delete result: ', deletePromise);
    //             return deletePromise;
    //         }
    //         else {
    //             return Promise.resolve();
    //         }
    //     }));
    // })

    // e.waitUntil(
    //    //self.clients.claim()保证新的serviceworker可以立马生效
    //     Promise.all([cacheDeletePromises]).then(()=>{return self.clients.claim()})    
    // )
    

    e.waitUntil(
    //获取所有cache名称 caches.keys 返回一个Promise，其被解析为一个Cache键的数组
    caches.keys().then(cacheNames => {
     return Promise.all(
     // 获取所有不同于当前版本名称cache下的内容
     cacheNames.filter(cacheNames => {
      return cacheNames !== cacheStorageKey
     }).map(cacheNames => {
      return caches.delete(cacheNames)
     })
     )
    }).then(() => {
     return self.clients.claim()
    })
    )
})
// self.addEventListener('fetch',function(e){
//     e.respondWith(
//     caches.match(e.request).then(function(response){
//      if(response != null){
//      return response
//      }
//      return fetch(e.request.url)
//     })
//     )
// })
//配置主页资源更新策略   首先使用网络请求缓存如果获取到资源就使用新资源，同时更新缓存，如果没有获取到则使用缓存中的资源。
self.addEventListener('fetch',function(e){
    console.log('Fetch event' + cacheStorageKey + ' :',e.request.url);
    e.respondWith(
        fetch(e.request.url)
        .then(function(httpRes){
            if(!httpRes || httpRes.status!==200){
                return caches.match(e.request);
            }
            var responseClone = httpRes.clone();
            caches.open(cacheStorageKey).then(function(cache){
                return cache.delete(e.request);
            })
            .then(function(){
                cache.put(e.request,responseClone );
            })
            return httpRes;
        })
        .catch(function(err){
            console.error(err);
            return caches.match(e.request);
        })
    )
})
self.addEventListener('beforeinstallprompt',function(e){
    e.userChoice.then(function(choiceResult){
        if (choiceResult === 'dismissed') {
           console.log('用户拒绝')
        }
        else {
            console.log('用户安装');
        }
    })})


