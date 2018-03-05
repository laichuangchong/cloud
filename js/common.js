/**
 * Created by chenzhongying on 2018/1/5.
 */


private_cloud.run(['$rootScope','$q',function($rootScope,$q){ //测试获取token
    $rootScope.token_promise = $q.defer(); //token 登录页面专用
    $rootScope.flavors_promise = $q.defer(); //配置类型
    $rootScope.testNumber = 1;
    $rootScope.adminstatus = {
        true: 'UP',
        false: 'DOWN'
    };
    $rootScope.ipVersion = [ //ip 版本
        {
            name:'Ipv4',
            value:4
        },
        {
            name:'Ipv6',
            value:6
        }
    ];
    $rootScope.diskStatus = {
        "in-use":'已挂载',
        available:'可用',
        creating:'正在创建',
        deleting:'删除中',
        detaching:'分离中',
        attaching:'连接中',
        error:'错误'
    };
    $rootScope.$on('$stateChangeStart', function () {
        // $rootScope.loading = true;
    });
    $rootScope.$on('$stateChangeSuccess', function () {
        // $rootScope.loading = false;
    });

    $rootScope.$on('$stateChangeError', function () {
        // $rootScope.loading = true;
    });
    $rootScope.headers = {
     'X-Auth-Token': window.localStorage.getItem('token'),
     'Accept': 'application/json'
     };
}]);