/**
 * Created by chenzhongying on 2018/1/5.
 */
private_cloud.controller('cloudComputerController', ['$scope', '$state', '$sce', '$rootScope', '$http', 'all_check_service', '$q', '$timeout', '$window', '$interval', '$location', 'count_service','images_service', function ($scope, $state, $sce, $rootScope, $http, all_check_service, $q, $timeout, $window, $interval, $location, count_service,images_service) {
    $scope.url = $location.path();
    count_service.getCount();//主要获取云主机、vcpus等相关信息
    $rootScope.count_promise.promise.then(function(data){
        console.log(data);
        $scope.count = data.count;
    });
    $scope.searchCloud = ''; //搜索内容
    $scope.warn = false;//警告框
    $scope.warnText = [];//警告文字
    $scope.vm_state = { //云主机状态
        building: '创建中',
        active: '运行中',
        rescued: '灾备运行',
        paused: '暂停',
        suspended: '挂起',
        stopped: '停止',
        soft_deleted: '软删除',
        hard_deleted: '应删除',
        resized: '确认/回退(调整配置)? ',
        error: '错误'
    };
    $scope.task_state = { //任务
        null: '无',
        building: '孵化',
        image_snapshotting: '正在创建快照',
        image_backingup: '备份',
        pausing: '暂停',
        unpausing: '暂停恢复',
        suspending: '正在挂起',
        resuming: '挂起恢复',
        deleting: '正在删除',
        stopping: '正在停止',
        starting: '正在启动',
        rescuing: '灾难恢复',
        unrescuing: '灾难复原',
        rebuilding: '正在重建',
        powering_on: '打开电源',
        powering_off: '关闭电源',
        resizing: '调整配置',
        resize_confirming: '配置调整确认',
        scheduling: '调度',
        block_device_mapping: '块设备映射',
        networking: '网络映射',
        spawning: '正在生成',
        reboot_started_hard: '正在重启',
        rebuild_spawning: '重建孵化中',
        "powering-off": '正在关闭电源',
        resize_finish: '已经重建',
        resize_reverting: '调整撤销中',
        "resize_migrated": '调整配置完毕',
        "resize_migrating": '正在调整配置',
        "image_uploading":'镜像上传中',
        "image_pending_upload":'等待上传镜像'
    };
    $scope.power_state = { //电池状态
        0: '无',
        1: '运行中',
        3: '暂停',
        4: '关闭',
        6: '崩溃',
        7: '挂起'
    };
    $scope.cloudHost = [];//云主机列表
    function resetState(obj, data) { //更新数据
        obj.vm = { //云主机状态
            state: data['OS-EXT-STS:vm_state'],
            text: $scope.vm_state[data['OS-EXT-STS:vm_state']]
        };
        obj.task = { //任务状态
            state: data['OS-EXT-STS:task_state'],
            text: $scope.task_state[data['OS-EXT-STS:task_state']]
        };
        obj.power = { //电源状态
            state: data['OS-EXT-STS:power_state'],
            text: $scope.power_state[data['OS-EXT-STS:power_state']]
        };
    }

    function reachImage(obj, imageId) { //查找镜像名称
        angular.forEach($scope.images, function (value, key) {
            if (imageId == value.id) {
                obj.imageName = value.name; //镜像名称
            }
        });
    }

    function reachFlover(obj) {  //查找配置
        for (var i = 0; i < $rootScope.flavors.length; i++) {
            if ($rootScope.flavors[i].id == obj.flavor.id) {
                return $rootScope.flavors[i]; //配置
            }
        }
    }

    function reachFloverIndex(flavorId) {  //查找配置类型在数据中的位置
        for (var i = 0; i < $rootScope.flavors.length; i++) {
            if ($rootScope.flavors[i].id == flavorId) {
                return i; //返回坐标
            }
        }
    }
    images_service.getImages();
    $rootScope.images_promise.promise.then(function (response) { //获取镜像之后执行
        console.log(response.data.images);
        $scope.images = response.data.images;
        $http({
            url: "/api/list_servers/detail", //获取云主机列表
            method: 'GET',
            headers: $rootScope.headers
        }).then(function (response) {
            var data = response.data.servers;
            console.log(data);
            angular.forEach(data, function (value, key) {
                var item = {};
                item.ipData = [];
                angular.forEach(value.addresses, function (value, key) { //获取IP
                    angular.forEach(value, function (value, key) {
                        console.log(value);
                        item.ipData.push(value);
                    });
                });
                item.flavor = reachFlover(value); //配置类型
                item.name = value.name; //云主机名称
                item.id = value.id; //云主机id
                var imageId = value.image.id; //镜像ID
                resetState(item, value); //获取任务状态
                reachImage(item, imageId); //查找备份名称

                if (value['OS-EXT-STS:task_state'] == null) {
                    $http({ //获取vnc地址
                        url: '/api/server_action/' + value.id,
                        method: 'POST',
                        headers: $rootScope.headers,
                        data: {
                            "os-getVNCConsole": {
                                "type": "novnc"
                            }
                        }

                    }).then(function (response) {
                        item.vnc = response.data.console.url;
                    }, function (response) {
                        alert(response.statusText);
                    });

                }

                $scope.cloudHost.push(item);

                if (value['OS-EXT-STS:task_state'] != null) { //如果有任务正在执行那就要监听这个任务状态
                    $scope['intervalInit' + key] = $interval(function () {
                        $http({
                            url: '/api/list_servers/' + item.id,
                            method: 'GET',
                            headers: $rootScope.headers
                        }).then(function (success) {
                            console.log(success);
                            var data = success.data.server;
                            resetState($scope.cloudHost[key], data); //更新任务状态
                            $scope.cloudHost[key].flavor = reachFlover(data); //更新配置
                            if (data['OS-EXT-STS:task_state'] == null) {
                                $scope.cloudHost[key].ipData = []; //IP地址初始化
                                $scope.cloudHost[key].vnc = ''; //vnc地址初始化
                                angular.forEach(data.addresses, function (value) { //获取IP
                                    angular.forEach(value, function (value) {
                                        $scope.cloudHost[key].ipData.push(value);
                                        console.log($scope.cloudHost[key].ipData);
                                    });
                                });
                                $interval.cancel($scope['intervalInit' + key]);
                                $scope['intervalInit' + key] = null;
                                $http({ //获取vnc地址
                                    url: '/api/server_action/' + value.id,
                                    method: 'POST',
                                    headers: $rootScope.headers,
                                    data: {
                                        "os-getVNCConsole": {
                                            "type": "novnc"
                                        }
                                    }

                                }).then(function (response) {
                                    $scope.cloudHost[key].vnc = response.data.console.url;
                                }, function (response) {
                                    alert(response.statusText);
                                });
                            }
                        }, function (error) {
                            alert(error.statusText);
                        });
                    }, 1000);
                }
                $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                    //you also get the actual event object
                    //do stuff, execute functions -- whatever...
                    $('#config' + key).popover({
                        html: true,
                        content: '<table class="table table-bordered table-striped table-condensed">' +
                        '<tbody>' +
                        '<tr>' +
                        '<td width="100px">VCPUs</td>' +
                        '<td width="100px">' + item.flavor.vcpus +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>内存</td>' +
                        '<td>' + item.flavor.ram / 1024 + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>大小</td>' +
                        '<td>' + item.flavor.disk + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>'
                    });
                });
            });
        }, function (response) {
            alert(response.statusText);
        });

    });


    $scope.deleteCloud = function (cloudId, name, index) { //删除云主机
        if (confirm('您确定删除' + name + '吗？此操作不可恢复！')) {
            $http({
                url: '/api/list_servers/' + cloudId,
                method: 'DELETE',
                headers: $rootScope.headers
            }).then(function (response) {
                if (response.status == 204) {
                    alert('操作成功');
                    $scope.cloudHost.splice(index, 1);
                }
            }, function (response) {
                alert(response.statusText);
            });
        }

    };
    $scope.restartComputer = function (cloudId, key) { //重启
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "reboot": {
                    "type": "HARD"
                }
            }
        }).then(function (response) {
            console.log(response);
            if (response.status == 202) {
                alert($scope.cloudHost[key].name + '重启成功');
                $scope['restartComputer' + key] = $interval(function () {
                    $http({
                        url: '/api/list_servers/' + cloudId,
                        method: 'GET',
                        headers: $rootScope.headers
                    }).then(function (success) {
                        console.log(success);
                        var data = success.data.server;
                        resetState($scope.cloudHost[key], data);
                        if (data['OS-EXT-STS:task_state'] == null) {
                            $interval.cancel($scope['restartComputer' + key]);
                            $scope['restartComputer' + key] = null;
                        }
                    }, function (error) {
                        alert(error.statusText);
                    });
                }, 1000);
            }
        }, function (response) {
            alert(response.statusText);
        });
    };
    $scope.all_check = false; //全选按钮状态
    $scope.allCheck = function (status) { //父选项
        all_check_service.allCheck(status, $scope.cloudHost);
    };
    $scope.itemCheck = function () { //子选项
        all_check_service.itemCheck($scope, $scope.cloudHost);
    };

    $scope.changeConfig = function () { //进度条
        if($scope.newConfig){
            $scope.coresChangeProgress = $scope.newConfig.vcpus - $scope.oldConfig.vcpus;
            $scope.ramChangeProgress = $scope.newConfig.ram / 1024 - $scope.oldConfig.ram / 1024;
            $scope.showConfig = $scope.newConfig;
        }else{
            $scope.showConfig = $scope.oldConfig;
            $scope.coresChangeProgress = 0;
            $scope.ramChangeProgress = 0;
        }
    };
    $scope.resetConfigInfo = function (info, key) { //调整配置弹框
        $scope.newConfig = ''; //初始化云主机类型选择项
        $scope.coresChangeProgress = 0; //初始化进度条
        $scope.ramChangeProgress = 0; //初始化进度条
        $scope.canSelectFlavors = angular.copy($rootScope.flavors); //深拷贝云主机类型
        $scope.canSelectFlavors.splice(reachFloverIndex(info.flavor.id), 1); //除去现在的配置类型方便用户选择
        $scope.showConfig = info.flavor;//初始化方案详情表格
        $scope.cloudId = info.id;//当前操作云主机Id
        $scope.oldConfig = info.flavor; //旧配置类型
        $scope.key = key; //获取当前操作的index
        count_service.getCount(); //获取最新的云主机使用情况
    };
    $scope.submitConfig = function () { //修改配置提交
        console.log($scope.cloudId);
        console.log($scope.newConfig);
        console.log($scope.diskConfig);
        $http({  //调整配置提交
            url: '/api/server_action/' + $scope.cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "resize": {
                    "flavorRef": $scope.newConfig.id,
                    "OS-DCF:diskConfig": $scope.diskConfig
                }
            }

        }).then(function (response) {
            console.log(response);
            $('#reset_config').modal('hide');

            $scope.intervalConfig = $interval(function () { //提交调整配置后监听状态
                $http({
                    url: '/api/list_servers/' + $scope.cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    resetState($scope.cloudHost[$scope.key], data);//更新任务状态
                    $scope.cloudHost[$scope.key].flavor = reachFlover(data); //更新配置
                    if (data['OS-EXT-STS:task_state'] == null) {
                        $interval.cancel($scope.intervalConfig);
                        $scope.intervalConfig = null;
                    }
                }, function (error) {
                    alert(error.statusText);
                });
            }, 1000);

        }, function (response) {
            alert(response.statusText);
        });

    };
    $scope.confirmConfig = function (cloudId, key) { //确认迁移
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "confirmResize": null
            }
        }).then(function (response) {
            console.log(response);
            $scope.intervalConfirmConfig = $interval(function () {
                $http({
                    url: '/api/list_servers/' + cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    resetState($scope.cloudHost[key], data);
                    if (data['OS-EXT-STS:vm_state'] == "stopped") {
                        $interval.cancel($scope.intervalConfirmConfig);
                        $scope.intervalConfirmConfig = null;
                        $state.go('count.cloudComputer', {}, {reload: true});
                    }
                }, function (error) {
                    alert(error.statusText);
                });
            }, 1000);
        }, function (response) {
            alert(response.statusText);
        });
    };

    $scope.returnConfig = function (cloudId, key) {  //回退配置
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "revertResize": null
            }
        }).then(function (response) {
            console.log(response);
            $state.go('count.cloudComputer', {}, {reload: true});
        }, function (response) {
            alert(response.statusText);
        });
    };
    $scope.reconstruction = function (cloudId, key) { //重建云主机获取当前操作云主机ID
        $scope.cloudId = cloudId;//当前操作云主机Id
        $scope.key = key;
        console.log($scope.key);
        $scope.selectImage = '';
    };

    $scope.submitResetCloudComputer = function () { //重建云主机
        console.log($scope.selectImage);
        $http({
            url: '/api/server_action/' + $scope.cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: {
                "rebuild": {
                    "imageRef": $scope.selectImage
                }
            }
        }).then(function (response) {
            console.log(response);
            if (response.status == 202) {
                $('#reset_cloud_computer').modal('hide');
                reachImage($scope.cloudHost[$scope.key], $scope.selectImage);
                $scope.intervalReconstruction = $interval(function () {
                    $http({
                        url: '/api/list_servers/' + $scope.cloudId,
                        method: 'GET',
                        headers: $rootScope.headers
                    }).then(function (success) {
                        console.log(success);
                        var data = success.data.server;
                        resetState($scope.cloudHost[$scope.key], data);

                        if (data['OS-EXT-STS:task_state'] == null) {
                            $interval.cancel($scope.intervalReconstruction);
                            $scope.intervalReconstruction = null;
                        }
                    }, function (error) {
                        alert(error.statusText);
                    });
                }, 1000);
            }
        }, function (response) {
            alert(response.statusText);
        });
    };

    $scope.showCloud = function (cloud_name) { //根据搜索内容显示隐藏
        if ($scope.searchCloud) {
            if (cloud_name.indexOf($scope.searchCloud) != -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    $scope.toggleComputer = function (status, cloudId, key, name) { //开关机切换
        var keystr = "os-" + status;
        var json = {};
        json[keystr] = null;
        $http({
            url: '/api/server_action/' + cloudId,
            method: 'POST',
            headers: $rootScope.headers,
            data: json
        }).then(function (success) {
            console.log(success);
            $scope['intervalToggle' + key] = $interval(function () {
                $http({
                    url: '/api/list_servers/' + cloudId,
                    method: 'GET',
                    headers: $rootScope.headers
                }).then(function (success) {
                    console.log(success);
                    var data = success.data.server;
                    resetState($scope.cloudHost[key], data);
                    if (data['OS-EXT-STS:task_state'] == null) {
                        $interval.cancel($scope['intervalToggle' + key]);
                        $scope['intervalToggle' + key] = null;
                    }
                }, function (error) {
                    alert(error.statusText);
                });
            }, 1000);
        }, function (error) {
            alert(error.statusText);
        });
    };
}]);
