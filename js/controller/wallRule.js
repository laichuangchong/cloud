/**
 * Created by chenzhongying on 2018/2/6.
 */
private_cloud.controller('wallRuleController',['$rootScope','$scope','$http','$state',function($rootScope,$scope,$http,$state){
    console.log($state);
    $http({
        url:'/api/list_segroups/'+$state.params.id,
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.name = response.data.security_group.name;
        $scope.rules = response.data.security_group.rules;
    },function(response){
        alert(response.statusText);
    });
}]);
