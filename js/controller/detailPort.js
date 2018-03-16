/**
 * Created by chenzhongying on 2018/3/16.
 */
private_cloud.controller('detailPortController',['$scope','$rootScope','$http','$state',function($scope,$rootScope,$http,$state){
    $http({
        url:'/api/net_ports/'+$state.params.id,
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.port = response.data.port;
    },function(response){
        alert(response.statusText);
    });
}]);