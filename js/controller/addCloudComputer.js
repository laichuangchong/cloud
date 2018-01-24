/**
 * Created by chenzhongying on 2018/1/11.
 */
private_cloud.controller('addCloudComputerController',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
    $scope.network = {lan:true};
    $scope.newConfig = $rootScope.flavors;
    $http({   //计算和防火墙
        url: '/api/nova_limits',
        method: 'GET',
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response.data.limits.absolute);
        var countData = response.data.limits.absolute;
        $scope.count = {
            instances: {
                title: '云主机',
                used: countData.totalInstancesUsed,
                total: countData.maxTotalInstances,
                unit: '个'

            },
            cores: {
                title: 'VCPUs',
                used: countData.totalCoresUsed,
                total: countData.maxTotalCores,
                unit: '个'
            },
            ram: {
                title: '内存',
                used: countData.totalRAMUsed / 1024,
                total: countData.maxTotalRAMSize / 1024,
                unit: 'GB'
            }
        };

    }, function (response) {
        console.log(response);
        // alert(response.data.error.message);
    });
    $scope.changeConfig = function (newConfig) { //进度条
        $scope.coresChangeProgress = newConfig.vcpus - $scope.oldConfig.vcpus; //vcpus
        $scope.ramChangeProgress = newConfig.ram / 1024 - $scope.oldConfig.ram / 1024; //内存
    };
   
}]);