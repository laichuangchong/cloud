/**
 * Created by chenzhongying on 2018/2/6.
 */
private_cloud.controller('wallRuleController', ['$rootScope', '$scope', '$http', '$state', '$timeout', function ($rootScope, $scope, $http, $state, $timeout) {
    console.log($state);
    $scope.direction = {
        "ingress": '入口',
        "egress": '出口'
    };
    //添加规则选项
    $scope.ruleItems = [
        {
            name: '定制TCP规则',
            type: 'type1',
            value: 'tcp'

        },
        {
            name: '定制UDP规则',
            type: 'type1',
            value: 'udp'
        },
        {
            name: '定制ICMP规则',
            type: 'type2',
            value: 'icmp'
        },
        {
            name: 'ALL ICMP',
            type: 'type3',
            value: 'all_icmp'
        },
        {
            name: 'ALL TCP',
            type: 'type3',
            value: 'all_tcp'
        },
        {
            name: 'ALL UDP',
            type: 'type3',
            value: 'all_udp'
        },
        {
            name: 'DNS',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'HTTP',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'HTTPS',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'IMAP',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'IMAPS',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'LDAP',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'MS SQL',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'MYSQL',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'POP3',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'POP3S',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'RDP',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'SMTP',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'SMTPS',
            type: 'type4',
            value: 'tcp'
        },
        {
            name: 'SSH',
            type: 'type4',
            value: 'tcp'
        }
    ]; //规则
    $scope.directionItems = [ //方向
        {
            name: '入口',
            value: 'ingress'
        },
        {
            name: '出口',
            value: 'egress'
        }
    ];
    $scope.portItems = [ //打开端口
        {
            name: '端口',
            value: 'port'
        },
        {
            name: '端口范围',
            value: 'range'
        }
    ];
    $scope.remoteItems = [ //远程
        {
            name: 'CIDR',
            value: 'cidr'
        },
        /*{
         name:'防火墙',
         value:'sg'
         }*/
    ];
    $scope.selectItem = {
        port: 'port'
    };
    $scope.type1 = true;
    $scope.ruleType = $scope.ruleItems[0];
    $scope.formData = {
        protocol: 'tcp',
        direction: 'ingress',
        ethertype: "IPv4",
        remote_ip_prefix: '0.0.0.0/0',
        security_group_id: $state.params.id
    };
    $scope.changeRule = function (type,value) {
        console.log(type);
        $scope.formData.protocol = value;
        switch (type) {
            case 'type1':
                $scope.type1 = true;
                $scope.type2 = false;
                $scope.type3 = false;
                $scope.type4 = false;
                break;
            case 'type2':
                $scope.type2 = true;
                $scope.type1 = false;
                $scope.type3 = false;
                $scope.type4 = false;
                break;
            case 'type3':
                $scope.type3 = true;
                $scope.type1 = false;
                $scope.type2 = false;
                $scope.type4 = false;
                break;
            case 'type4':
                $scope.type4 = true;
                $scope.type1 = false;
                $scope.type2 = false;
                $scope.type3 = false;
                $scope.formData.direction = 'ingress';
                break;
        }

    };
    $http({
        url: '/api/list_segroups/' + $state.params.id,
        headers: $rootScope.headers
    }).then(function (response) {
        console.log(response);
        $scope.name = response.data.security_group.name;
        $scope.rules = response.data.security_group.security_group_rules;
    }, function (response) {
        alert(response.statusText);
    });
    $scope.deleteRule = function (ruleId, ruleName) { //删除规则
        if (confirm('确定要删除规则吗？')) {
            $http({
                url: '/api/serules/' + ruleId,
                method: 'DELETE',
                headers: $rootScope.headers
            }).then(function (response) {
                console.log(response);

            }, function (response) {
                alert(response.statusText);
            });
        }
    };
    $scope.formSubmit = function ($event) { //添加规则表单
        $event.preventDefault();
        switch ($scope.formData.protocol) {
            case 'dns':
                $scope.formData.port_range_min = $scope.icmpType;
                $scope.formData.port_range_max = $scope.icmpCode;
                break;
            case 'dns':
                $scope.formData.port_range_min = 53;
                $scope.formData.port_range_max = 53;
                break;
            case 'http':
                $scope.formData.port_range_min = 80;
                $scope.formData.port_range_max = 80;
                break;
            case 'https':
                $scope.formData.port_range_min = 443;
                $scope.formData.port_range_max = 443;
                break;
            case 'imap':
                $scope.formData.port_range_min = 143;
                $scope.formData.port_range_max = 143;
                break;
            case 'imaps':
                $scope.formData.port_range_min = 993;
                $scope.formData.port_range_max = 993;
                break;
            case 'ldap':
                $scope.formData.port_range_min = 389;
                $scope.formData.port_range_max = 389;
                break;
            case 'ms_sql':
                $scope.formData.port_range_min = 1433;
                $scope.formData.port_range_max = 1433;
                break;
            case 'mysql':
                $scope.formData.port_range_min = 3306;
                $scope.formData.port_range_max = 3306;
                break;
            case 'pop3':
                $scope.formData.port_range_min = 110;
                $scope.formData.port_range_max = 110;
                break;
            case 'pop3s':
                $scope.formData.port_range_min = 995;
                $scope.formData.port_range_max = 995;
                break;
            case 'rdp':
                $scope.formData.port_range_min = 3389;
                $scope.formData.port_range_max = 3389;
                break;
            case 'smtp':
                $scope.formData.port_range_min = 25;
                $scope.formData.port_range_max = 25;
                break;
            case 'smtps':
                $scope.formData.port_range_min = 465;
                $scope.formData.port_range_max = 465;
                break;
            case 'ssh':
                $scope.formData.port_range_min = 22;
                $scope.formData.port_range_max = 22;
                break;
        }
        $http({
            url: '/api/serules/',
            headers: $rootScope.headers,
            method: 'POST',
            data: {
                "security_group_rule": $scope.formData
            }

        }).then(function (response) {
            console.log(response);
            $('#add_rule').modal('hide');
            $timeout(function () {
                $state.go('security.rule', {id: $state.params.id}, {reload: true});
            }, 1000);
        }, function (response) {
            alert(response.statusText);
        });
    };
}]);
