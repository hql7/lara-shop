var recharge = {
    wallet_type: 0
}; // 充值参数

// var order = {}; // 生成订单信息

//-------------------------------充值页 请求------------------------------

// 请求生成充值单
function makeRechargeList(th) {
    $.ajax({
        url: getApi('web/recharge'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            money: $('#money').val(),
            wallet_type: recharge.wallet_type
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            $(th).attr('disabled', false);
            if (res.code === 0) {
                // order = res.order_info;
                location.href = 'pay.html?oid=' + res.order_info.id + '&no=' + res.order_info.no + '&real_price=' + res.order_info.real_price + ''
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            $(th).attr('disabled', false);
            _msg({msg: '请重试'})
        }
    })
}

//-------------------------------充值页 功能------------------------------

// 表单验证
function vada(th) {
    $('#recForm').validate({
        rules: {
            money: {
                required: true,
                number: true
            },
            wallet: {
                required: true
            }
        },
        messages: {
            wallet: '请选择充值的钱包类型'
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.closest('li'));
        },
        errorElement: "b",
        submitHandler: function () {
            // 禁用按钮
            $(th).attr('disabled', true);
            makeRechargeList(th)
        }
    })
}