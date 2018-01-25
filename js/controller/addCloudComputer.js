/**
 * Created by chenzhongying on 2018/1/11.
 */
private_cloud.controller('addCloudComputerController',['$scope','$rootScope','$http','$state',function($scope,$rootScope,$http,$state){

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
                    "security_groups": [  //可选项防火墙
                        {
                            "name": "default"
                        }
                    ],
                    "networks":[  //可选项
                        {
                            "uuid": "80bee3ca-4981-4285-b682-943e77d7a4c7"
                        }
                    ],
                    "min_count": $scope.formData.computerCount
                }

            }

        }).then(function(response){
            console.log(response);
            if(response.status == 202){
                alert('添加成功');
                $state.go("count.cloudComputer");
            }
        },function(){

        });
    };

}]);