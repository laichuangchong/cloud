/**
 * Created by chenzhongying on 2018/1/9.
 */
private_cloud.service('tokenService', ['$http', '$rootScope', '$timeout', function ($http, $rootScope, $timeout) {
    return {
        /*"user": {
         "name": "admin",
         "domain": {
         "name": "Default"
         },
         "password": "openstack"
         }*/
        getToken: function (userName, password) { //登录服务用账号
            $http({
                url: './apiv1',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                data: {
                    "auth": {
                        "identity": {
                            "methods": [
                                "password"
                            ],
                            "password": {
                                "user": {
                                    "name": userName,
                                    "domain": {
                                        "name": "Default"
                                    },
                                    "password": password
                                }
                            }
                        },
                        "scope": {
                            "project": {
                                "name": "admin",
                                "domain": {
                                    "name": "Default"
                                }
                            }
                        }
                    }
                }
            }).then(function (response) {
                console.log(response);
                window.localStorage.setItem('token', response.headers()['x-subject-token']);
                window.localStorage.setItem('project_id', response.data.token.project.id);
                window.localStorage.setItem('username', userName);//用户名
                window.localStorage.setItem('password', password);//密码
                $rootScope.token_promise.resolve(response.headers()['x-subject-token']);

            }, function (response) {
                alert(response.data.error.message);
            });
        }
    };

}]);
private_cloud.service('all_check_service', function () { //全选
    return {
        allCheck: function (status, item_obj) {
            if (status) {
                angular.forEach(item_obj, function (value, key) {
                    value.check_status = true;
                });

            } else {
                angular.forEach(item_obj, function (value, key) {
                    value.check_status = false;
                });
            }
        },
        itemCheck: function (obj, item_obj) {
            var mark = true;
            angular.forEach(item_obj, function (value, key) {
                if (!value.check_status) {
                    obj.all_check = false;
                    mark = false;
                }
            });
            if (mark) {
                obj.all_check = true;
            }
        }
    };
});
private_cloud.service('less_one_service', function () { //至少选择一项
    return {
        change: function (data) {
            var mark = false;
            angular.forEach(data, function (value, key) {
                if (value) {
                    mark = true;
                }
            });
            if (mark) {
                return true;

            } else {
                return false;
            }
        }
    };
});
private_cloud.service('count_service', ['$http','$rootScope', function ($http,$rootScope) { //计算和防火墙
        return {
            getCount: function () {
                $http({
                    url: '/api/nova_limits',
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (response) {
                    console.log(response.data.limits.absolute);
                    var countData = response.data.limits.absolute;
                    $rootScope.count = {
                        instances: {
                            title: '云主机',
                            used: countData.totalInstancesUsed,
                            total: countData.maxTotalInstances,
                            unit: '个'

                        },
                        cores: {
                            title: 'VCPUs',
                            used: countData.totalCoresUsed,
                            total: countData.maxTotalCores,
                            unit: '个'
                        },
                        ram: {
                            title: '内存',
                            used: countData.totalRAMUsed / 1024,
                            total: countData.maxTotalRAMSize / 1024,
                            unit: 'GB'
                        }
                    };

                }, function (response) {
                    alert(response.statusText);
                });
            }
        };
    }]
);