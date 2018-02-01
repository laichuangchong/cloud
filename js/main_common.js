/**
 * Created by chenzhongying on 2018/1/18.
 */
private_cloud.run(['$rootScope','$q','$http','tokenService','count_service',function($rootScope,$q,$http,tokenService,count_service){ //测试获取token
    tokenService.getToken(localStorage.getItem('username'), localStorage.getItem('password'));
    // $rootScope.network_promise = $q.defer();
    $rootScope.images_promise = $q.defer();
    $rootScope.flavors_promise = $q.defer();
    $rootScope.net_work = {};//网络类型名称
    $rootScope.token_promise.promise.then(function (token) {
        $rootScope.headers = {
            'X-Auth-Token':token,
            'Accept': 'application/json'
        };
        console.log('重新获取成功'+token);
        $http({ //获取镜像
            url: "/api/list_images",
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            console.log(response.data.images);
            $rootScope.images = response.data.images;//所有镜像列表
            $rootScope.images_promise.resolve();
        }, function (response) {
            alert(response.data.error.message);
        });

        $http({ //获取所有配置类型
            url: "/api/list_flavors/detail",
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            console.log(response);
            $rootScope.flavors = response.data.flavors;
            $rootScope.flavors_promise.resolve();
        }, function (response) {
            alert(response.data.error.message);
        });

        $http({ //获取所有网络类型
            url: "/api/list_networks",
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            console.log(response.data.networks);
            $rootScope.net_work = response.data.networks;
            console.log($rootScope.net_work);
            // $rootScope.network_promise.resolve();
        }, function (response) {
            alert(response.data.error.message);
        });

       
    }, function (info) {
        console.log(info);
    });
}]);