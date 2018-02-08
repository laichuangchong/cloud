/**
 * Created by chenzhongying on 2018/2/6.
 */
private_cloud.controller('wallRuleController',['$rootScope','$scope','$http','$state',function($rootScope,$scope,$http,$state){
    console.log($state);
    $scope.direction = {
        "ingress":'入口',
        "egress":'出口'
    };
    $http({
        url:'/api/list_segroups/'+$state.params.id,
        headers:$rootScope.headers
    }).then(function(response){
        console.log(response);
        $scope.name = response.data.security_group.name;
        $scope.rules = response.data.security_group.security_group_rules;
    },function(response){
        alert(response.statusText);
    });
    $scope.deleteRule = function(ruleId,ruleName){ //删除规则
        if(confirm('确定要删除规则吗？')){
            $http({
                url:'/api/serules/'+ruleId,
                method:'DELETE',
                headers:$rootScope.headers
            }).then(function(response){
                console.log(response);

            },function(response){
                alert(response.statusText);
            });
        }
    };
}]);
