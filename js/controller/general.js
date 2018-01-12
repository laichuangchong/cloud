/**
 * Created by chenzhongying on 2018/1/5.
 */

private_cloud.controller('generalController', ['$scope', '$rootScope', '$http','$q',function ($scope, $rootScope, $http,$q) {
    $scope.get_used_network_promise = $q.defer();
    $scope.headers = {
        'X-Auth-Token':localStorage.getItem('token'),
        'Accept': 'application/json'
    };

    $http({   //计算和防火墙
        url: '/api/nova_limits',
        method: 'GET',
        headers:$scope.headers
    }).then(function (response) {
        console.log(response.data.limits.absolute);
        var countData = response.data.limits.absolute;
        $scope.count = {
            instances:{
                title:'云主机',
                used:countData.totalInstancesUsed,
                total:countData.maxTotalInstances,
                unit:'个'

            },
            cores:{
                title:'VCPUs',
                used:countData.totalCoresUsed,
                total:countData.maxTotalCores,
                unit:'个'
            },
            ram:{
                title:'内存',
                used:countData.totalRAMUsed/1024,
                total:countData.maxTotalRAMSize/1024,
                unit:'GB'
            }
        };
        $scope.safe = {
            security:{
                title:'防火墙',
                used:countData.totalSecurityGroupsUsed,
                total:countData.maxSecurityGroups,
                unit:'个'
            }
        };

    },function(response){
        console.log(response);
        alert(response.data.error.message);
    });

    $http({ //网络
        url: '/api/net_quotas',
        method: 'GET',
        headers:$scope.headers
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
               headers:$scope.headers
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