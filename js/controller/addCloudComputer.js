/**
 * Created by chenzhongying on 2018/1/11.
 */
private_cloud.controller('addCloudComputerController',['$scope','$rootScope','$http','$state','less_one_service','count_service','images_service',function($scope,$rootScope,$http,$state,less_one_service,count_service,images_service){

    $scope.formData = { //创建云主机数据
        computerCount:1,
        net_work : [],
        security:true
    };
    if($state.params.imageid){ //如果是备份页面来的就指定镜像名称
        $scope.formData.imageRef = $state.params.imageid;
    }
    count_service.getCount();
    images_service.getImages(); //获取镜像
    $rootScope.images_promise.promise.then(function(response){
        $scope.images = response.data.images;
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
            alert(response.statusText);
        });
    };
   
    $scope.changeNetworkMark = function(){ //标示有无操作

        $scope.changeNetwork = true;
        console.log($scope.changeNetwork);
    };
    
    $scope.lessone = function(data){
        return less_one_service.change(data);

    };

}]);