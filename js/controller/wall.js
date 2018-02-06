/**
 * Created by chenzhongying on 2018/2/6.
 */
private_cloud.controller('wallController',['$rootScope','$scope','$http',function($rootScope,$scope,$http){
    $http({
        url:' /api/list_security',
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.walls = response.data.security_groups;
    },function(response){
        alert(response.statusText);
    });
}]);