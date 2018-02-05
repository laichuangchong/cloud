/**
 * Created by chenzhongying on 2018/1/16.
 */
private_cloud.controller('cloudDiskController',['$scope','$rootScope','$http','cloud_service','$interval',function($scope,$rootScope,$http,cloud_service,$interval){
    $scope.diskStatus = {
        "in-use":'已挂载',
        available:'可用',
        creating:'正在创建',
        deleting:'删除中',
        detaching:'分离中',
        attaching:'连接中',
        error:'错误'
    };
    $http({ //云硬盘列表
        url:'/api/list_volumes',
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.disks = response.data.volumes;
        angular.forEach($scope.disks,function(value,key){
            if((value.status != "in-use") && (value.status !="available") && (value.status !='error')){
                console.log(key);
                $scope['volumesInterval' + key] = $interval(function () {
                    $http({
                        url: ' /api/list_volumes/'+value.id,
                        headers: $rootScope.headers
                    }).then(function (response) {
                        console.log(response);
                        var data = response.data.volume.status;
                        if ((data == "in-use") || (data == "available") || (data == 'error')) {
                            $interval.cancel($scope['volumesInterval' + key]);
                            $scope['volumesInterval' + key] = null;
                        }
                    },function(response){
                        alert(response.statusText);
                    });
                }, 10000);

            }
        });

    },function(response){
        alert(response.statusText);
    });

    cloud_service.getCloud();
    $rootScope.cloud_promise.promise.then(function(response){
        console.log(response);
    });

    $scope.editInuse = function(){ //编辑挂在
        
    };
}]);