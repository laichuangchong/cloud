/**
 * Created by chenzhongying on 2018/1/5.
 */


private_cloud.run(['$rootScope','$q','$interval',function($rootScope,$q,$interval){ //测试获取token
    $rootScope.token_promise = $q.defer();
    //换页加载特效

    $rootScope.$on('$stateChangeStart', function () {
        // $rootScope.loading = true;
        if (angular.isDefined($rootScope.interval)) {
            $interval.cancel($rootScope.interval);
            $rootScope.interval = null;
        }
    });
    $rootScope.$on('$stateChangeSuccess', function () {
        // $rootScope.loading = false;
    });

    $rootScope.$on('$stateChangeError', function () {
        // $rootScope.loading = true;
    });
}]);