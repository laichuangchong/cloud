/**
 * Created by chenzhongying on 2018/1/18.
 */
private_cloud.run(['$rootScope','$q','tokenService',function($rootScope,$q,tokenService){ //测试获取token
    tokenService.getToken(localStorage.getItem('username'), localStorage.getItem('password'));

    $rootScope.token_promise.promise.then(function (token) {
        $rootScope.headers = {
            'X-Auth-Token':token,
            'Accept': 'application/json'
        };
        console.log('重新获取成功'+token);
    }, function (info) {
        console.log(info);
    });
}]);