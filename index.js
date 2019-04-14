(function(){
    function registerServiceWorker(file){
        return navigator.serviceWorker.register(file);
    }
       /**
     * 用户订阅相关的push信息
     * 会生成对应的pushSubscription数据，用于标识用户与安全验证
     * @param {ServiceWorker Registration} registration
     * @param {string} publicKey 公钥
     * @return {Promise}
     */
    function subscribUserToPush(registration,publickey){
        var subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey:window.urlBase64ToUint8Array(publickey)
        };
        return registration.pushManager.subscribe(subscribeOptions).then(function(pushSubscription){
            console.log('Receive PushSubscription',JSON.stringify(pushSubscription));
            return pushSubscription;
        })
    }

    /**
     * 将浏览器生成的subscription信息提交到服务端
     * 服务端保存该信息用于向特定的客户端用户推送
     * @param {string} body 请求体
     * @param {string} url 提交的api路径，默认为/subscription
     * @return {Promise}
     */
    function sendSubcriptionToServer(body,url){
        url = url || '/subscription';
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.timeout = 60000;
            xhr.onreadystatechange = function(){
                var response = {};
                if(xhr.status === 200 && xhr.readyState === 4){
                    try {
                        response = JSON.parse(xhr.responseText);
                    }
                    catch(e){
                        response = xhr.responseText;
                    }
                    resolve(response);
                }
                else if(xhr.readyState === 4){
                    resolve();
                }
                xhr.onabort = reject;
                xhr.onerror = reject;
                xhr.ontimeout = reject;
                xhr.open('POST',url, true);
                xhr.setRequestHeader('Content-type','application/json');
                xhr.send(body);
            }
        })
    }

    if('serviceWorker' in navigator && 'PushManager' in window){
        // var publickey = 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A';
        // //注册serviceWorker 
        // registerServiceWorker('./sw.js').then(function(registration){
        //     console.log('sw注册成功');
        //     //开启客户端消息推送订阅功能
        //     return subscribUserToPush(registration,publickey);
        // }).then(function(subscription){
        //     var body = {subscription:subscription};
        //     //为了方便以后的推送，为每个客户端简单生成一个标识
        //     body.uniqueid = new Date().getTime();
        //     console.log('uniqueid', body.uniqueid);
        //     //将生成的客户端订阅信息存储在自己的服务器上
        //     return sendSubcriptionToServer(JSON.stringify(body));
        // }).then(function(res){
        //     console.log(res);
        // }).catch(function(err){
        //     console.log(err);
        // })
         //注册serviceWorker 
        registerServiceWorker('./sw.js').then(function(registration){
             console.log('sw注册成功');
        });
    }
    window.addEventListener('offline', function() {
      Notification.requestPermission().then(function(grant){
          if(grant !== 'granted'){
             return;
          }
          var notification = new Notification("Hi，网络不给力哟", {
            body: '您的网络貌似离线了，不过访问过的页面还可以继续打开~',
            icon: './youhun.png'
          });
         notification.onclick = function(){
                notification.close();
            };
      })  
    })
})()