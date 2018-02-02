/**
 * Created by chenzhongying on 2018/1/18.
 */
private_cloud.run(['$rootScope','$q','$http','tokenService','count_service',function($rootScope,$q,$http,tokenService,count_service){ //测试获取token

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
    }, function (response) {
        alert(response.data.error.message);
    });
}]);