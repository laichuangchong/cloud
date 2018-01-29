/**
 * Created by chenzhongying on 2018/1/11.
 */
private_cloud.controller('addCloudComputerController',['$scope','$rootScope','$http','$state','less_one_service',function($scope,$rootScope,$http,$state,less_one_service){

    $scope.formData = { //创建云主机数据
        computerCount:1,
        net_work : []
    };
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
    $scope.changeConfig = function (flavorRef) { //进度条
        console.log(flavorRef);
        $scope.coresChangeProgress = flavorRef.vcpus; //vcpus
        $scope.ramChangeProgress = flavorRef.ram / 1024 ; //内存
    };
    

    $scope.formSubmit = function($event){
        $event.preventDefault();
        var security = [], networks = []; //防火墙类型/网络类型
        
        if($scope.formData.security){
            security.push ({
                "name": "default"
            });
        }
        angular.forEach($scope.formData.net_work,function(value,key){
            if(value){
                networks.push({
                    "uuid": $rootScope.net_work[key].id
                });
            }
        });
        console.log(networks);
        $http({
            url: "/api/list_servers/", //添加云主机
            method: 'POST',
            headers: $rootScope.headers,
            data:{
                "server" : {
                    "name" : $scope.formData.name,
                    "imageRef" : $scope.formData.imageRef,
                    "flavorRef" : $scope.formData.flavorRef.id,
                    "availability_zone": "nova",
                    "OS-DCF:diskConfig": "AUTO",
                    "security_groups": security, //防火墙
                    "networks":networks,//网络类型
                    "min_count": $scope.formData.computerCount
                }

            }

        }).then(function(response){
            console.log(response);
            if(response.status == 202){
                alert('添加成功');
                $state.go("count.cloudComputer");
            }
        },function(response){
            alert(response.data.forbidden.message);
        });
    };
   
    $scope.changeNetworkMark = function(){ //标示有无操作
        $scope.changeNetwork = true;
    };
    $scope.lessone = function(data){
        return less_one_service.change(data);

    };

}]);