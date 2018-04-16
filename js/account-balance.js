var page = {
    index: 1,
    total: 1,
    type: 0,// 类型  0=消费记录  1=充值记录  2=提现记录
    size: 10
}; // 分页

getMemberInfo(); // 获取会员信息

//-----------------------账户余额 请求---------------------------

// log列表请求
function getBalanceLog(tp) {
    $.ajax({
        url: getApi('web/balance_log'),
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
                $('#_bal_log').html(banlanceLogHtml(res.list))
            }
        }
    })
}

// 获取会员信息
function getMemberInfo() {
    // if (getobjS('userInfo')) {
    //     // 用户信息
    //     $('#_us_ye').html('￥' + getobjS('userInfo').balance);
    //     $('#_us_djye').html('￥' + getobjS('userInfo').freeze_balance);
    //     $('#_us_zt').html(accountLogStatus(getobjS('userInfo').status));
    // } else {
    updateMemberInfo()
    // }
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
                $('#_us_ye').html('￥' + res.info.balance);
                $('#_us_djye').html('￥' + res.info.freeze_balance);
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
    })
}

//-----------------------账户余额 功能---------------------------

//tab切换
$('#_log_tit>li').click(function () {
    $(this).addClass('act').siblings('li').removeClass('act');
    page.type = $(this).index();
    getBalanceLog(page.type);
    page.index = 1;
}).eq(0).click();

// 日志html
function banlanceLogHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<tr><td>' + data[i].time + '</td>' +
            '<td>' + data[i].amount + '</td>' +
            '<td>' + data[i].amount_log + '</td>' +
            '<td>' + data[i].order_no + '</td>' +
            '<td>' + walletType(data[i].wallet_type) + '</td>' +
            '<td>' + data[i].intro + '</td></tr>'
    }
    return html

    /*switch (page.type) {
        case 0:
            for (var i = 0, len = data.length; i < len; i++) {
                html += '<tr><td>' + data[i].time + '</td>' +
                    '<td>' + data[i].amount + '</td>' +
                    '<td>' + data[i].amount_log + '</td>' +
                    '<td>' + data[i].order_no + '</td>' +
                    '<td>' + data[i].wallet_type + '</td>' +
                    '<td>' + data[i].intro + '</td></tr>'
            }
            break;
        case 1:
            for (var j = 0, len2 = data.length; j < len2; j++) {
                html += '<tr><td>' + data[j].time + '</td>' +
                    '<td>' + data[j].amount + '</td>' +
                    // '<td>' + data[j].recharge_no + '</td>' +
                    // '<td><em>' + banlanceLogStatus(data[j].status) + '</em></td>' +
                    '<td>' + data[j].order_no + '</td>' +
                    '<td>正常</td>' +
                    '<td>' + data[j].intro + '</td></tr>'
            }
            break;
        case 2:
            for (var k = 0, len3 = data.length; k < len3; k++) {
                html += '<tr><td>' + data[k].time + '</td>' +
                    '<td>' + data[k].amount + '</td>' +
                    // '<td>' + data[k].withdraw_no + '</td>' +
                    '<td>' + data[k].order_no + '</td>' +
                    '<td><em>' + banlanceLogStatus(data[k].status) + '</em></td>' +
                    '<td>' + data[k].intro + '</td></tr>'
            }
            break;
    }*/
}

// 记录状态管理
function banlanceLogStatus(sta) {
    var str = '';
    switch (sta) {
        case 0:
            str = '审核中';
            break;
        case 1:
            str = '已完成';
            break;
        case 2:
            str = '已拒绝';
            break;
    }
    return str
}

// 钱包类型
function walletType(tp) {
    var html = '';
    switch (tp) {
        case 0:
            html = '账户余额';
            break;
        case 1:
            html = '支付宝';
            break;
        case 2:
            html = '冻结资金';
            break;
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
                page.index = obj.curr;
                //首次不执行
                if (!first) {
                    //do something
                    getBalanceLog(page.type);
                }
            }
        });
    });
}

// 去充值
function toRecharge() {
    location.href = 'recharge.html';
}

// 去提现
function toWithdrawals() {
    location.href = 'withdrawals.html';
}
