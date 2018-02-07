/**
 * Created by chenzhongying on 2018/2/7.
 */
private_cloud.controller('cloudDiskDetailController',['$scope','$rootScope','$http','$state','cloud_service','$q',function($scope,$rootScope,$http,$state,cloud_service,$q){
    $scope.disk_promise = $q.defer();
    $http({
        url:'/api/list_volumes/'+$state.params.id,
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.disk_promise.resolve(response.data.volume);
    },function(response){
        alert(response.statusText);
    });
    function searchCloud(clouds,serverId){ //查看绑定云主机名称
        for(var i=0; i<clouds.length; i++){
            if(clouds[i].id == serverId) {
                return clouds[i];
            }
        }
    }
    cloud_service.getCloud(); //获取云主机信息
    $q.all([$scope.disk_promise.promise,$rootScope.cloud_promise.promise]).then(function(data){
        console.log(data);
        $scope.disk = data[0];
        $scope.cloud = data[1].data.servers;
        console.log($scope.disk.attachments[0].serverId);
        $scope.cloudMsg = searchCloud($scope.cloud,$scope.disk.attachments[0].serverId);
        console.log($scope.cloudMsg);
    });

}]);
// 2acf9d81-c6e4-4ff3-af0b-d470898914e8