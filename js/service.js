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
            }).success(function (data, status, headers, config) {
                console.log(data.token.project.id);
                console.log(status);
                // this callback will be called asynchronously
                // when the response is available
                window.localStorage.setItem('token',headers()['x-subject-token']);
                window.localStorage.setItem('project_id',data.token.project.id);
                $rootScope.token_promise.resolve(headers()['x-subject-token']);

            }).error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                $rootScope.token_promise.reject('获取token失败');
            });
        }
    };

}]);