/**
 * Created by chenzhongying on 2018/3/2.
 */
private_cloud.controller('addNetworkController',['$scope','$rootScope','$state','$http',function($scope,$rootScope,$state,$http){
    $scope.formData = {
        admin_state_up: 'true',
        shared: false
    };
    $scope.formSubmit = function(){
        $http({
            url:'/api/net_networks/',
            method:'POST',
            headers:$rootScope.headers,
            data:{
                network:$scope.formData
            }
        }).then(function(response){
            console.log(response);
            $state.go('network.userNetwork');
        },function(response){
            alert(response.statusText);
        });
    };
    
}]);