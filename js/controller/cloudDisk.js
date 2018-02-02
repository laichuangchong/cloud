/**
 * Created by chenzhongying on 2018/1/16.
 */
private_cloud.controller('cloudDiskController',['$scope','$rootScope','$http','cloud_service',function($scope,$rootScope,$http,cloud_service){
    $scope.diskStatus = {
        "in-use":'已挂载',
        available:'可用',
        creating:'正在创建',
        deleting:'删除中',
        detaching:'分离中',
        attaching:'连接中',
        Error:'错误'
    };
    $http({
        url:'/api/list_volumes',
        headers:$rootScope.headers,

    }).then(function(response){
        console.log(response);
        $scope.disks = response.data.volumes;

    },function(response){
        alert(response.statusText);
    });
    cloud_service.getCloud();
    $rootScope.cloud_promise.promise.then(function(response){
        alert('cloud-disk');
        console.log(response);
    });

}]);