/**
 * Created by chenzhongying on 2018/1/5.
 */

private_cloud.controller('generalController', ['$scope', '$rootScope', '$http','$q','count_service','volume_service',function ($scope, $rootScope, $http,$q,count_service,volume_service) {
    $scope.get_used_network_promise = $q.defer();
    count_service.getCount(); //获取云主机防火墙信息
    $rootScope.count_promise.promise.then(function(data){
        console.log(data);
        $scope.count = data.count;
        $scope.safe = data.safe;
    });
    volume_service.getVolume(); //获取云主机防火墙信息
    $rootScope.volume_promise.promise.then(function(data){
        console.log(data);
        $scope.storage = data;
    });
    $http({ //网络
        url: '/api/net_quotas',
        method: 'GET',
        headers:$rootScope.headers
    }).then(function (response) {
        console.log(response.data.quotas[0]);
        var networkTotalData = response.data.quotas[0];
        $scope.network =
            {
                floatingips:{
                    title:'公网IP',
                    total:networkTotalData.floatingip,
                    unit:'个'
                },
                routers:{
                    title:'路由器',
                    total:networkTotalData.router,
                    unit:'个'
                },
                ports:{
                    title:'端口',
                    total:networkTotalData.port,
                    unit:'个'
                },
                networks:{
                    title:'网络',
                    total:networkTotalData.network,
                    unit:'个'
                },
                subnets:{
                    title:'子网',
                    total:networkTotalData.subnet,
                    unit:'个'
                }
            };
        console.log($scope.network);
        $scope.get_used_network_promise.resolve();
    },function(response){
        console.log(response);
        alert(response.data.error.message);
    });
    $scope.get_used_network_promise.promise.then(function(){
       angular.forEach($scope.network,function(value,key){
           console.log(key);
           $http({         //已使用存储
               url: '/api/net_'+key,
               method: 'GET',
               headers:$rootScope.headers
           }).then(function (response) {
               console.log(response.data[key].length);
               $scope.network[key].used = response.data[key].length;

           },function(response){
               console.log(response);
               alert(response.data.error.message);
           });
       });

    });
}]);