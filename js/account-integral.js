var page = {
    index: 1,
    total: 1,
    size: 10,
    type: 0 // 类型  0=全部  1=下单赠送积分  2=下单消费  3=订单退货  4=退款
}; // 分页
var repeat = 0; // 防抖

getMemberInfo(); // 获取会员信息

//-----------------------账户余额 请求---------------------------

// log列表请求
function getIntegralLog(tp) {
    $.ajax({
        url: getApi('web/point_log'),
        type: 'post',
        data: {
            index: page.index,
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            type: tp
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                page.total = res.fy_count;
                page.size = res.fy_pgSize;
                if (res.fy_pgCur === 1) {
                    layuiPage()
                }
                $('#_int_log').html(integralLogHtml(res.list))
            }
        }
    })
}

// 获取会员信息
function getMemberInfo() {
    /*if (getobjS('userInfo')) {
        // 用户信息
        $('#_us_jf').html(+getobjS('userInfo').point);
        $('#_us_ye').html('￥' + getobjS('userInfo').balance);
        $('#_us_zt').html(accountLogStatus(getobjS('userInfo').status));
    } else {
        updateMemberInfo()
    }*/
    updateMemberInfo()
}

// 更新会员信息
function updateMemberInfo() {
    $.ajax({
        url: getApi('web/user_info'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 用户信息
                $('#_us_jf').html(+res.info.point);
                $('#_us_ye').html('￥' + res.info.balance);
                $('#_us_zt').html(accountLogStatus(res.info.status));
                // 储存
                var userInfo = {
                    balance: res.info.balance,
                    freeze_balance: res.info.freeze_balance,
                    status: res.info.status,
                    point: res.info.point
                };
                setobjS('userInfo', userInfo)
            }
        }
    }).then(getSystemConfig('shopping'))
}

// 余额转换积分
function moneyToIntegral(ind, lay) {
    var reg = /^[1-9]\d*(\.\d+)?$/.test($('#_int_money').val());
    if (reg) {
        repeat++;
        $.ajax({
            url: getApi('web/transfer'),
            type: 'post',
            data: {
                user_id: getobjS('user').id,
                token: getobjS('user').token,
                money: $('#_int_money').val()
            },
            dataType: 'jsonp',
            success: function (res) {
                loginOverdue(res.code);
                lay.msg(res.msg);
                if (res.code === 0) {
                    lay.close(ind);
                    getIntegralLog();
                    updateMemberInfo();
                } else {
                    lay.msg(res.msg)
                }
            },
            error: function (err) {
                lay.msg('请重试')
            }
        }).done(function () {
            repeat = 0;
        })
    } else {
        // $('#pop_points').append('<p id="ts">请输入大于0的数字金额</p>')
        lay.msg('请输入大于0的数字金额')
    }
}

//-----------------------账户余额 功能---------------------------

//tab切换
$('#_log_tit>li').click(function () {
    $(this).addClass('act').siblings('li').removeClass('act');
    page.type = $(this).index();
    getIntegralLog(page.type);
    page.index = 1;
}).eq(0).click();

// 日志html
function integralLogHtml(data) {
    var html = '';
    if (data) {
        for (var i = 0, len = data.length; i < len; i++) {
            html += '<tr><td>' + data[i].time + '</td>' +
                '<td>' + data[i].point + '</td>' +
                '<td>' + data[i].order_no + '</td>' +
                '<td>' + data[i].intro + '</td></tr>'
        }
    }

    return html
}

// 账号状态管理
function accountLogStatus(sta) {
    var str = '';
    switch (sta) {
        case 0:
            str = '正常';
            break;
        case 1:
            str = '禁用';
            break;
        case 2:
            str = '冻结';
            break;
        case 3:
            str = '禁用+冻结';
            break;
    }
    return str
}

// 激活分页
function layuiPage() {
    layui.use('laypage', function () {
        var laypage = layui.laypage;
        //执行一个laypage实例
        laypage.render({
            elem: 'page' //注意，这里的 page 是 ID，不用加 # 号
            , count: page.total //数据总数，从服务端得到
            , limit: page.size
            , jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                // console.log(obj.limit); //得到每页显示的条数
                //首次不执行
                if (!first) {
                    page.index = obj.curr;
                    //do something
                    getIntegralLog(page.type);
                }
            }
        });
    });
}

// 兑换积分
function exchangePoints(th) {
    $(th).attr('disabled', true);
    layui.use('layer', function () {
        $('#_int_p_tx').text(getobjS('shopping').point_money);
        var layer = layui.layer;
        layer.open({
            title: '兑换积分'
            , type: 1
            , content: $('#pop_points')
            , btnAlign: 'l'
            , area: '500px'
            , btn: ['确定', '取消']
            , yes: function (index, layero) {
                //按钮【按钮一】的回调
                $(th).attr('disabled', false);
                if (repeat === 0) {
                    moneyToIntegral(index, layer);
                }
            }
            , btn2: function (index, layero) {
                //按钮【按钮二】的回调
                //return false 开启该代码可禁止点击该按钮关闭
                $(th).attr('disabled', false);
                repeat = 0;
            }
            , cancel: function () {
                //右上角关闭回调
                //return false 开启该代码可禁止点击该按钮关闭
                $(th).attr('disabled', false);
                repeat = 0;
            }
        });
    });
}

// 积分换购
function pointBuy() {
    _msg({msg: '暂未开通 敬请期待'})
}

