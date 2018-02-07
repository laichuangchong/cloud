/**
 * Created by chenzhongying on 2018/2/6.
 */
private_cloud.controller('wallController',['$rootScope','$scope','$http',function($rootScope,$scope,$http){
    $http({
        url:' /api/list_segroups',
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.walls = response.data.security_groups;
    },function(response){
        alert(response.statusText);
    });
    $scope.formData = {};//初始化表单数据
    $scope.formSubmit = function(){ //创建防火墙
        $http({
            url:' /api/list_segroups',
            method:'POST',
            headers:$rootScope.headers,
            data:{
                name:$scope.formData.wallName,
                description:$scope.formData.description
            }
        }).then(function(response){
            console.log(response);
        },function(response){
            alert(response.statusText);
        });
    };
}]);