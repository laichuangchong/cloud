/**
 * Created by chenzhongying on 2018/1/5.
 */


private_cloud.run(['$rootScope','$q',function($rootScope,$q){ //测试获取token
    $rootScope.token_promise = $q.defer();
}]);