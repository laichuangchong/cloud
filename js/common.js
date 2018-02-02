/**
 * Created by chenzhongying on 2018/1/5.
 */


private_cloud.run(['$rootScope','$q',function($rootScope,$q){ //测试获取token
    $rootScope.token_promise = $q.defer(); //token 登录页面专用
    $rootScope.flavors_promise = $q.defer(); //配置类型
    $rootScope.cloud_promise = $q.defer(); //获取云主机列表
    $rootScope.images_promise = $q.defer(); //获取镜像

    $rootScope.$on('$stateChangeStart', function () {
        // $rootScope.loading = true;
    });
    $rootScope.$on('$stateChangeSuccess', function () {
        // $rootScope.loading = false;
    });

    $rootScope.$on('$stateChangeError', function () {
        // $rootScope.loading = true;
    });
    $rootScope.headers = {
     'X-Auth-Token': window.localStorage.getItem('token'),
     'Accept': 'application/json'
     };
}]);