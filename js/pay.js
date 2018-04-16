var pay = {
    no: getSearch().no,
    type: 0, // 0=商品购买  1=账户充值
    what: null // 支付方式
}; // 支付信息

payForWhat();
if (pay.type === 0) { //商品购买
    getPayForOrder();
} else {
    getPayRecharge();
}

getPayWhat();

//商城LOGO
systemLogo();
// ------------------------------付款页 请求---------------------------------

// 商品购买订单信息请求
function getPayForOrder() {
    $.ajax({
        url: getApi('web/order_detail'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            order_id: getSearch().oid
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                pay.no = res.order_info.order_no;
                $('#o_id').html(res.order_info.order_no);
                $('#o_time').html(res.order_info.create_time);
                $('#o_addr').html(res.order_info.accept_addr);
                $('#o_money').html(res.order_info.order_amount);
            }
        }
    })
}

// 充值单信息
function getPayRecharge() {
    $('#o_id').html(pay.no);
    $('._pay_order p').css('display', 'none');
    $('#o_money').html(getSearch().real_price);
}


// 获取支付方式
function getPayWhat() {
    $.ajax({
        url: getApi('web/pay_type'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            type: pay.type
        },
        dataType: 'jsonp',
        success: function (res) {
            var fs = '';
            if (res.code === 0) {
                var str = '';
                for (var i = 0, len = res.pay_type.length; i < len; i++) {
                    str += '<li data-id="' + res.pay_type[i].id + '"><i class="iconfont icon-check ic_no"></i><i class="iconfont icon-xuanzhong3 ic_act"></i>' +
                        '<img src="' + res.pay_type[i].logo + '" alt=""><em>' + res.pay_type[i].name + '</em></li>'
                }
                $('#_pay_box').html(str);
                // 选择支付方式
                $('.ic_no').click(function () {
                    // 每次声明盒子来接受选中id
                    pay.what = $(this).parent('li').attr('data-id');
                    $(this).css('display', 'none')
                        .next('i').show()
                        .parent('li').addClass('pay_act')
                        .siblings('li').removeClass('pay_act')
                        .find('.ic_act').css('display', 'none')
                        .prev('.ic_no').css('display', '');
                });
            }
        }
    });
}

// 确认支付
function toPay() {
    if (pay.what) {
        var reg = /^\S{6,18}$/.test($('#tradePass').val());
        if (reg) {
            antiShakeObj.antiShake(function (resolve, reject) {
                $.ajax({
                    url: getApi('web/pay_order'),
                    type: 'post',
                    data: {
                        user_id: getobjS('user').id,
                        token: getobjS('user').token,
                        safepass: $('#tradePass').val(),
                        order_no: pay.no,
                        pay_id: pay.what,
                        pay_type: 0,
                        pay_way: 0
                    },
                    dataType: 'jsonp',
                    success: function (res) {
                        resolve(res);
                        if (res.code == 0) {
                            if (pay.what == 1) {
                                // _msg({msg: res.msg});
                                setInterval(function () {
                                    location.href = 'my-order.html?s=2'
                                }, 2000)

                            } else {
                                $('#pay_form').css('display', 'none').html(res.msg)
                            }
                        } else {
                            // _msg({msg: res.msg});
                        }
                    },
                    error: function (err) {
                        reject(err);
                        // _msg({msg: '请重试'});
                    }
                })
            })
        } else {
            _msg({msg: '交易密码为6到18位字母/数字/特殊字符'})
        }
    } else {
        _msg({msg: '请选择支付方式'})
    }
}

// ------------------------------付款页 功能---------------------------------

// 支付类型
function payForWhat() {
    var reg = /^C_/.test(pay.no);
    if (reg) {
        pay.type = 1
    } else {
        pay.type = 0
    }
}
