/**
 * Created by chenzhongying on 2018/2/8.
 */
private_cloud.controller('userNetworkController',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
    $scope.adminstatus = {
        true:'UP',
        false:'DOWN'
    };
    $http({
        url:'/api/net_networks/',
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.networks = response.data.networks;
    },function(response){
        alert(response.statusText);
    });
}]);