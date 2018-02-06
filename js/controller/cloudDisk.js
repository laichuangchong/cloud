/**
 * Created by chenzhongying on 2018/1/16.
 */
private_cloud.controller('cloudDiskController',['$scope','$rootScope','$http','cloud_service','$interval','volume_service',
    '$state','$timeout',function($scope,$rootScope,$http,cloud_service,$interval,volume_service,$state,$timeout){
    $scope.diskStatus = {
        "in-use":'已挂载',
        available:'可用',
        creating:'正在创建',
        deleting:'删除中',
        detaching:'分离中',
        attaching:'连接中',
        error:'错误'
    };

    function searchCloud(clouds,key,odj){ //查看绑定云主机名称
        angular.forEach(clouds,function(cloudValue){
            if(cloudValue.id == odj.attachments[0].serverId) {
                $scope.disks[key].cloud = cloudValue;
            }
        });
    }

    volume_service.getVolume(); //获取云硬盘使用情况相关信息
    $rootScope.volume_promise.promise.then(function (data) {
        console.log(data);
        $scope.volumesUsedPercent =  data.volumes.used/data.volumes.total;
        $scope.gigabytesUsedPercent =  data.gigabytes.used/data.gigabytes.total;
    });
    cloud_service.getCloud(); //获取云主机信息
    $rootScope.cloud_promise.promise.then(function (response) {
        console.log(response);
        $scope.clouds = response.data.servers;
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
                            var status = response.data.volume.status;
                            $scope.disks[key].status = status;
                            if( response.data.volume.attachments.length != 0){
                                searchCloud($scope.clouds,key,response.data.volume);
                            }
                            if ((status == "in-use") || (status == "available") || (status == 'error')) {
                                $interval.cancel($scope['volumesInterval' + key]);
                                $scope['volumesInterval' + key] = null;
                            }
                        },function(response){
                            alert(response.statusText);
                        });
                    }, 1000);
                }
                if(value.attachments.length != 0){
                    searchCloud($scope.clouds,key,value);
                }
            });

        },function(response){
            alert(response.statusText);
        });
    });



    $scope.deleteDisk = function(diskName,diskId,key){ //删除云硬盘
        if(confirm('确定删除云硬盘'+diskName+'吗？')){
            $http({ //云硬盘列表
                url:'/api/list_volumes/'+diskId,
                method:'DELETE',
                headers:$rootScope.headers
            }).then(function(response){
                console.log(response);
                alert('删除成功');
                $scope.disks.splice(key,1);
            },function(response){
                alert(response.statusText);
            });
        }
    };
    $scope.formSubmit = function(formName){
        switch(formName){
            case "$formLinkCloud": //绑定云主机
                $http({
                    url:'/api/volume_attach/'+$scope.selectCloud,
                    method:'POST',
                    headers:$rootScope.headers,
                    data:{
                        "volumeAttachment": {
                            "volumeId": $scope.diskId,
                            "device": "/dev/vdb"
                        }
                    }
                }).then(function(response){
                    console.log(response);
                    $('#link_cloud').modal('hide');
                    $timeout(function(){
                        $state.go('storage.couldDisk',{},{reload: true});
                    },500);
                },function(response){
                    alert(response.statusText);
                });
                break;
            case '$formCutCloud': //断开连接云主机
                if(confirm('确定要断开云硬盘'+$scope.diskName+'吗？')){
                    $http({
                        url:'/api/volume_attach/'+$scope.linkedCloud+'/'+$scope.diskId,
                        method:'DELETE',
                        headers:$rootScope.headers,
                    }).then(function(response){
                        console.log(response);
                        $('#cut_link').modal('hide');
                        $timeout(function(){
                            $state.go('storage.couldDisk',{},{reload: true});
                        },1000);
                    },function(response){
                        alert(response.statusText);
                    });
                }
                break;
        }
    };
    $scope.showModalLinkCloud = function(diskId){ //编辑挂载弹出框
        $scope.selectCloud = '';
        $scope.$formLinkCloud.selectCloud.$dirty = false;
        $scope.diskId = diskId; //当前操作云硬盘ID
    };
    $scope.showModalCutCloud = function(linkedCloud,diskId,diskName){ //编辑挂载弹出框
        $scope.linkedCloud = '';
        $scope.linkedCloud = linkedCloud; //当前操作云硬盘绑定云主机ID
        $scope.diskId = diskId; //当前操作云硬盘ID
        $scope.diskName = diskName; //当前操作云硬盘ID

    };
    
}]);