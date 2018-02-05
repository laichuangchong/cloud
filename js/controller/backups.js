/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('backupsController', ['$scope', '$state','$rootScope','$http', 'all_check_service','cloud_service','$timeout',function ($scope,$state,$rootScope, $http, all_check_service,cloud_service,$timeout) {
    $scope.backups = [];//备份列表
    cloud_service.getCloud();
    $rootScope.cloud_promise.promise.then(function(response){
        console.log(response);
        $scope.clouds = response.data.servers;
        $http({
            url:'/api/list_images/detail',
            headers: $rootScope.headers
        }).then(function(response){
            console.log(response);
            angular.forEach(response.data.images,function(value,key){
                if(value.metadata.image_type == "snapshot" || value.metadata.image_type == "backup"){
                    var item = value;
                    angular.forEach($scope.clouds,function(subvalue,subkey){
                        if(subvalue.id == value.server.id){
                            item.cloudName = subvalue.name;
                        }
                    });
                    $scope.backups.push(value);
                }
            });

        },function(response){
            alert(response.statusText);
        });
    });

    
    $scope.all_check = false; //全选按钮状态
    console.log($scope.all_check);
    $scope.allCheck = function (status) { //父选项
        all_check_service.allCheck(status, $scope.hostList);
    };
    $scope.itemCheck = function () { //子选项
        all_check_service.itemCheck($scope);

    };
    $scope.deleteBase = function (name,id,key) {
        if (confirm('确定删除' + name + "吗？这个动作不能撤消哦")) {
            $http({
                url: "/api/list_images/"+id, //获取云主机列表
                method: 'DELETE',
                headers: $rootScope.headers
            }).then(function (response) {
                console.log(response);
                alert('删除成功');
                $scope.backups.splice(key,1);
            },function(response){
                alert(response.statusText);
            });
        }
    };
    $scope.formSubmit = function(event){ //提交表单
        event.preventDefault();
        $http({
            url: "/api/server_action/"+$scope.selectCloud, //获取云主机列表
            method: 'POST',
            headers: $rootScope.headers,
            data:{
                "createBackup": {
                    "name": $scope.backupName,
                    "backup_type": "daily",
                    "rotation": 1
                }
            }
        }).then(function (response) {
            console.log(response);
            $('#creat_backup').modal('hide');
            $timeout(function(){
                $state.go('count.backups',{},{reload:true});
            },1000);
        },function(response){
            alert(response.statusText);
        });

    };
}]);