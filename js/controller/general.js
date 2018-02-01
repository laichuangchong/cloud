/**
 * Created by chenzhongying on 2018/1/5.
 */

private_cloud.controller('generalController', ['$scope', '$rootScope', '$http','$q','count_service',function ($scope, $rootScope, $http,$q,count_service) {
    $scope.get_used_network_promise = $q.defer();
    count_service.getCount(); //获取云主机防火墙信息
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
           $http({ //已使用存储
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
    $http({
        url:"/api/volume_limits/"+localStorage.getItem('project_id'),
        method: 'GET',
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response.data.limits.absolute);
        var storageData = response.data.limits.absolute;
        $scope.storage = {
            volumes:{
                title:'云硬盘',
                used:storageData.totalVolumesUsed,
                total:storageData.maxTotalVolumes,
                unit:'个'
            },
            gigabytes:{
                title:'云硬盘容量',
                used:storageData.totalGigabytesUsed,
                total:storageData.maxTotalVolumeGigabytes,
                unit:'GB'
            }
        };
    },function(response){
        alert(response.data.error.message);
    });
}]);