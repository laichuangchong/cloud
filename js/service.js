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
            console.log(status);
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