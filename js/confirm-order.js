// 参数声明
var shop = {}; // 商城发票 税率等配置项
var invoice = {
    use: false, // 是否使用
    type: 0, // 0个人||1企业
    need: 0, // 0不要发票 || 1要
    rise: '', // 抬头
    code: '', // 纳税人识别号
    FP: '' // 发送数据所需拼接格式
}; // 发票功能
var YHQ = {
    id: '', // id
    jr: '', // 金额
    jf: 0 // 是否使用积分
}; // 优惠券使用信息
var addres = {
    id: '', // 收货地址id
    name: '', // 收货人
    pid: '', // 省id ->处理编辑时省份被覆盖的问题
    pname: '请选择' // 省名
}; // 地址信息
var prom_orders = []; // 订单活动数据盒子
var settlement = {
    total: 0, // 总价
    yf: 0, // 运费
    sj: 0, // 税金,
    yhq: 0, // 优惠券
    jf: 0, // 积分
    hdjr: 0, // 活动金额
    hdid: null // 活动id
}; // 总计金额
var pay = ''; // 支付方式
var order = {}; // 订单提交后接收返回订单信息
var repeat = 0; // 防抖
var ssx = {
    province_id: '' // 省id
}; // 省市县信息

/*// 购物配置项
if (!getobjS('shopping')) {
    $.ajax({
        url: getApi('web/config_info'),
        type: 'post',
        data: {
            title: 'shopping'
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                setobjS('shopping', res.info);
                shop = res.info;
                if (shop.open_invoice == 0) {
                    invoice.use = false;
                    $('._co_invoice').css('display', 'none')
                } else {
                    invoice.use = true;
                    $('._co_invoice').css('display', 'block')
                }
            }
        }
    })
} else {
    shop = getobjS('shopping');
    if (shop.open_invoice == 0) {
        invoice.use = false;
        $('._co_invoice').css('display', 'none')
    } else {
        invoice.use = true;
        $('._co_invoice').css('display', 'block')
    }
}*/

// 请求数据
confirmOrder();
// 请求配置项
getSiteShopping();
// 未登录限制
noLogin();

//------------------------确认订单页 请求---------------------------
// 订单数据
function confirmOrder() {
    $.ajax({
        url: getApi('web/order_confirm'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            addr_id: addres.id
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // 订单金额
                settlement.total = res.amount_info.total_price;
                settlement.yf = res.amount_info.total_ship;
                // 收货人信息
                if (res.address.id) {
                    $('._co_address').find('strong').html('<a>' + res.address.accept_name + '<i class="iconfont icon-xuanzhong"></i></a>')
                        .next('span').html(res.address.accept_name)
                        .next('b').html(res.address.address)
                        .next('em').html(res.address.mobile);
                    addres.id = res.address.id;
                    addres.name = res.address.accept_name;
                } else {
                    $('._co_address').find('strong').html('<a>请添加地址<i class="iconfont icon-jinggao"></i></a>')
                }
                // 订单信息
                var str = '';
                for (var i = 0, len = res.goods.length; i < len; i++) {
                    str += '<div class="_co_l"><div class="_c-l-img"><a href="goods.html?id=' + res.goods[i].good_id + '">' +
                        '<img src="' + res.goods[i].img + '" alt="good"></a></div><div class="_c-l-info">' +
                        '<h2>商家：<em>' + res.goods[i].shop_name + '</em></h2><h3><span>' + (res.goods[i].sale_title || '热卖' ) + '</span>' +
                        '' + res.goods[i].sale_desc + '</h3><div><h3><a href="goods.html?id=' + res.goods[i].good_id + '">' +
                        '' + res.goods[i].good_name + '</a></h3><p><em>￥' + res.goods[i].price + '</em><b>x' + res.goods[i].num + '</b>' +
                        '<span>运费：' + res.goods[i].ship_money + '</span></p></div><p>' + res.goods[i].spec_str + '</p></div></div>'
                }
                $('#_co_list').html(str);
                // 发票信息
                /*if (shop.open_invoice === 1) {
                    var sl = parseFloat(shop.tax_invoice);
                    var jg = parseFloat(res.amount_info.total_price);
                    $('#_co_invoice_tax').val((jg * sl / 100).toFixed(2));
                }*/
                // 优惠券
                var str1 = '';
                for (var j = 0, len1 = res.vouchers.length; j < len1; j++) {
                    str1 += '<div data-qid="' + res.vouchers[j].id + '" data-jr="' + res.vouchers[j].value + '"><div class="_yhq_t"><h4><em>￥' + res.vouchers[j].value + '</em>' +
                        '满' + res.vouchers[j].money + '</h4><p>有效期至' + res.vouchers[j].end_time + '</p></div><div class="_yhq_b">' + res.vouchers[j].condition + '</div></div>'
                }
                $('._co_yhq').html(str1);
                // 订单活动
                if (res.prom_orders.length > 0) {
                    // 接受订单活动数据供选择活动函数使用
                    prom_orders = res.prom_orders;
                    var str2 = '';
                    for (var k = 0, len2 = res.prom_orders.length; k < len2; k++) {
                        str2 += '<option value="' + res.prom_orders[k].id + '" data-tp="' + res.prom_orders[k].type + '" data-ex="' + res.prom_orders[k].expression + '">' +
                            '' + res.prom_orders[k].name + '' + (res.prom_orders[k].expression ? "（" + res.prom_orders[k].expression + "）" : "") + '</option>'
                    }
                    $('#_co_ddcx').html('<select id="prom_order_id"><option value="">请选择</option>' + str2 + '</select>');
                    // 选择订单活动操作
                    $('#prom_order_id').change(selectActivity)
                } else {
                    $('#_c_ddcx').css('display', 'none')
                }
                // 结算数据
                $('#_co_zje').html((res.amount_info.total_price * 100 / 100).toFixed(2));
                $('#_co_num-A').html(res.amount_info.total_num);
                $('#_co_freight-A').html((res.amount_info.total_ship * 100 / 100).toFixed(2));
                if (parseFloat(res.amount_info.total_point) >= parseFloat(res.amount_info.user_point)) {
                    var pt_A = (parseFloat(res.amount_info.user_point) * parseFloat(res.amount_info.point_money)).toFixed(2);
                } else {
                    var pt_A = (parseFloat(res.amount_info.total_point) * parseFloat(res.amount_info.point_money)).toFixed(2);
                }
                $('#_co_points-A').html(pt_A);
                $('#_co_jfye').html(res.amount_info.user_point);
                $('#_co_zsjf').html(res.amount_info.send_point);
                // 应付信息
                $('#_co_yf').html((res.amount_info.total_price * 100 / 100).toFixed(2));
                $('#_co_pay_addr').html(res.address.address);
                $('#_co_pay_shr').html(res.address.accept_name);
                $('#_co_pay_phone').html(res.address.mobile);
                // 选择优惠券操作
                $('#_co_yhq > div').click(function () {
                    if (!$(this).hasClass('_yhq_act')) {
                        settlement.yhq = parseInt($(this).attr('data-jr'));
                        $(this).addClass('_yhq_act').siblings('div').removeClass('_yhq_act');
                        YHQ.id = $(this).attr('data-qid');
                        YHQ.jr = parseInt($(this).attr('data-jr'));
                        $('#_co_spyhq').text(YHQ.jr);
                        // 调用应付计算
                        $('#_co_yf').html(computePayable())
                    } else {
                        // 取消优惠券
                        $(this).removeClass('_yhq_act');
                        YHQ.jr = 0.00;
                        $('#_co_spyhq').text(YHQ.jr);
                        // 调用应付计算
                        settlement.yhq = 0.00;
                        $('#_co_yf').html(computePayable())
                    }
                });
                // 选择使用积分操作
                if (res.amount_info.total_point > 0 && res.amount_info.user_point > 0) {
                    $('#use_jf').change(function () {
                        if ($(this).is(':checked')) {
                            YHQ.jf = 1;
                            settlement.jf = pt_A;
                        } else {
                            YHQ.jf = 0;
                            settlement.jf = 0;
                        }
                        // 调用应付计算
                        $('#_co_yf').html(computePayable())
                    })
                } else {
                    $('#_c_jfdk').css('display', 'none')
                }

                // 调用计算总价
                $('#_co_yf').html(computePayable())
            } else {
                _msg({msg: res.msg});
                setInterval(function () {
                    window.history.back();
                }, 2000)
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

// 获取全部收货地址
function getAllAddress(th) {
    $(th).attr('disabled', true);
    $.ajax({
        url: getApi('web/address_list'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            var adr = null; // 暂存所点击地址id 防止点击选择地址后不是点确定而是点取消和关闭时addres.id被覆盖；
            var str = '';
            for (var i = 0, len = res.list.length; i < len; i++) {
                str += '<div class="_pop_addr" data-id="' + res.list[i].id + '">' +
                    '<strong>' + res.list[i].accept_name + '</strong><span>' + res.list[i].accept_name + '</span>' +
                    '<b>' + res.list[i].location + '&nbsp;&nbsp;' + res.list[i].addr + '</b>' +
                    '<em>' + res.list[i].mobile + '</em></div>'
            }
            $('#pop_address').html(str);
            // 激活layui插件
            layui.use('layer', function () {
                var layer = layui.layer;
                layer.open({
                    type: 1,
                    title: '选择收货地址',
                    area: ['900px'],
                    btn: ['确定', '取消'],
                    content: $('#pop_address'),
                    yes: function (index, layero) {
                        // 点确定时再给地址盒子id覆盖
                        addres.id = adr;
                        // 检验是否选择了收货地址
                        if (addres.id) {
                            // 请求订单
                            confirmOrder();
                            layer.close(index)
                        } else {
                            layer.msg('选择收货地址')
                        }
                    }
                });
            });
            $(th).attr('disabled', false);
            // 选择地址
            $('._pop_addr').click(function () {
                $(this).addClass('addr_act').siblings('div').removeClass('addr_act');
                adr = $(this).attr('data-id')
            })
        }
    })
}

// 验证并处理订单提交数据
function validateOrder(th) {
    $(th).attr('disabled', true);
    if (!addres.id) {
        _msg({msg: '请选择收货地址'})
    } else {
        if (invoice.need === 1) {
            if (invoice.type === 1) {
                invoice.FP = '1:' + $('#inv_rise').find('input').val() + ':' + $('#inv_code').find('input').val()
            } else {
                invoice.FP = '0:' + addres.name
            }
        } else {
            invoice.FP = ''
        }
        // 调用提交
        submitOrder(th)
    }
}

// 提交订单
function submitOrder(th) {
    antiShakeObj.antiShake(function (resolve, reject) {
        $.ajax({
            url: getApi('web/create_order'),
            type: 'post',
            data: {
                user_id: getobjS('user').id,
                token: getobjS('user').token,
                addr_id: addres.id,
                remark: $('._co_remarks').find('input').val(),
                voucher_id: YHQ.id,
                prom_order_id: $('#prom_order_id').val(),
                use_point: YHQ.jf,
                invoice: invoice.FP
            },
            dataType: 'jsonp',
            success: function (res) {
                resolve(res);
                loginOverdue(res.code);
                if (res.code === 0) {
                    order = res.order_info;
                    // 调用支付方式
                    getPayWhat(th);
                } else {
                    // _msg({msg: res.msg})
                }
            },
            error: function (err) {
                reject(err);
                // _msg({msg: '请重试'})
            }
        })
    })
}

// 获取支付方式
function getPayWhat(th) {
    $.ajax({
        url: getApi('web/pay_type'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            type: 0
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
                $('#pop_pay ul').html(str);
                // 解除按钮禁制
                $(th).attr('disabled', false);
                // 选择支付方式
                $('.ic_no').click(function () {
                    // 每次声明盒子来接受选中id
                    fs = $(this).parent('li').attr('data-id');
                    $(this).css('display', 'none')
                        .next('i').show()
                        .parent('li').addClass('pay_act')
                        .siblings('li').removeClass('pay_act')
                        .find('.ic_act').css('display', 'none')
                        .prev('.ic_no').css('display', '');
                });
                layui.use('layer', function () {
                    var layer = layui.layer;
                    layer.open({
                        type: 1,
                        title: '选择支付方式',
                        area: ['600px'],
                        btn: ['确定', '取消'],
                        btnAlign: 'l',
                        content: $('#pop_pay'),
                        yes: function (index, layero) {
                            var reg = /^\S{6,18}$/.test($('#tradePass').val());
                            if (fs) {
                                if (reg && repeat === 0) {
                                    // 点击确定再赋给最终支付方式
                                    pay = fs;
                                    // 调用支付请求
                                    payFor(layer, index)
                                } else {
                                    layer.msg('密码为6到18位字母/数字/特殊字符')
                                }
                            } else {
                                layer.msg('请选择支付方式')
                            }
                        }
                        , btn2: function (index, layero) {
                            location.href = 'my-order.html?s=1'
                        }
                        , cancel: function () {
                            location.href = 'my-order.html?s=1'
                        }
                    });
                });
            }
        }
    });
}

// 支付订单
function payFor(lay, ind) {
    antiShakeObj.antiShake(function (resolve, reject) {
        $.ajax({
            url: getApi('web/pay_order'),
            type: 'post',
            data: {
                user_id: getobjS('user').id,
                token: getobjS('user').token,
                safepass: $('#tradePass').val(),
                order_no: order.no,
                pay_id: pay,
                pay_type: 0,
                pay_way: 0
            },
            dataType: 'jsonp',
            success: function (res) {
                resolve(res);
                loginOverdue(res.code);
                if (res.code === 0) {
                    if (pay == 1) {
                        // lay.msg(res.msg);
                        lay.close(ind);
                        setInterval(function () {
                            location.href = 'my-order.html?s=2'
                        }, 2000)
                    } else {
                        $('#pay_form').css('display', 'none').html(res.msg)
                    }
                }
            },
            error: function (err) {
                reject(err);
                // lay.msg('请重试');
            }
        })
    })
}

// 编辑地址
function editAddress(th) {
    $(th).attr('disabled', true);
    $.ajax({
        url: getApi('web/address_edit'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            address_id: addres.id
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                if (!addres.id) {
                    $('#province').html('<option value="">请选择</option>');
                    $('#city').html('<option value="">请选择</option>');
                    $('#county').html('<option value="">请选择</option>');
                } else {
                    // 地址信息
                    $('#consignee').val(res.info.accept_name);
                    $('#province').html('<option value="' + res.info.province_id + '">' + res.info.province_name + '</option>');
                    ssx.province_id = res.info.province_id
                    $('#city').html('<option value="' + res.info.city_id + '">' + res.info.city_name + '</option>');
                    $('#county').html('<option value="' + res.info.county_id + '">' + res.info.county_name + '</option>');
                    $('#street').val(res.info.addr);
                    $('#mobile').val(res.info.mobile);
                    $('#phone').val(res.info.phone);
                    $('#zip').val(res.info.zip);
                    addres.pid = res.info.province_id;
                    addres.pname = res.info.province_name;
                }

                // 弹出
                layui.use('layer', function () {
                    var layer = layui.layer;
                    layer.open({
                        type: 1,
                        title: '编辑收货地址',
                        area: ['760px'],
                        btn: ['确定', '取消'],
                        content: $('#pop_edit_add'),
                        yes: function (index, layero) {
                            if (vaEditAddr().form() && repeat === 0) {
                                // $('#edit_add_form').submit();
                                repeat++;
                                saveAddr(layer, index);
                            }
                        }
                    });
                });
                $(th).attr('disabled', false);
                getRegion(0, 0)
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

// 保存地址验证
function vaEditAddr() {
    return $('#edit_add_form').validate({
        rules: {
            consignee: {
                required: true,
                rangelength: [2, 8]
            },
            province: {
                required: true
            },
            city: {
                required: true
            },
            county: {
                required: true
            },
            street: {
                required: true,
                rangelength: [4, 20]
            },
            mobile: {
                required: true,
                phone: true
            }
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.parent());
        },
        errorElement: "em"
    });
}

// 保存地址
function saveAddr(lay, ind) {
    $.ajax({
        url: getApi('web/address_save'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            id: addres.id,
            accept_name: $('#consignee').val(),
            province: $('#province').val(),
            city: $('#city').val(),
            county: $('#county').val(),
            addr: $('#street').val(),
            mobile: $('#mobile').val(),
            phone: $('#phone').val(),
            zip: $('#zip').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                lay.msg(res.msg);
                lay.close(ind);
                // 重新请求订单
                confirmOrder();
            } else {
                lay.msg(res.msg);
            }
        },
        error: function (err) {
            lay.msg('请重试');
        }
    }).done(function () {
        repeat = 0
    })
}

// 请求省市县
function getRegion(val, id) {
    $.ajax({
        url: getApi('coms/get_area'),
        type: 'post',
        data: {
            web: true,
            id: id
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                disposeRegion(val, res.list)
            } else {
                var html = '<option value="">请选择地址</option>';
                $('#city').html(html);
                $('#county').html(html);
            }
        }
    })
}

// 获取购物相关配置项
function getSiteShopping() {
    $.ajax({
        url: getApi('web/config_info'),
        type: 'post',
        data: {
            title: 'shopping'
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                shop = res.info;
                if (shop.open_invoice == 0) {
                    invoice.use = false;
                    $('._co_invoice').css('display', 'none')
                } else {
                    invoice.use = true;
                    $('._co_invoice').css('display', 'block')
                }
            }
        }
    })
}

//------------------------确认订单页 功能-------------------------------

// 是否开发票
function invoiceIsNeed(val) {
    invoice.need = val;
    if (val === 0) {
        settlement.sj = 0
    } else {
        settlement.sj = (settlement.total * parseFloat(shop.tax_invoice) / 100).toFixed(2);
    }
    $('#_co_invoice_tax').val(settlement.sj);
    $('#_co_fpsj').html(settlement.sj);
    // 计算应付
    $('#_co_yf').html(computePayable());
}

// 个人||企业
function invoiceType(val) {
    invoice.type = val;
    if (val === 0) {
        $('#inv_rise,#inv_code').css('display', 'none')
    } else {
        $('#inv_rise,#inv_code').css('display', 'block')
    }
}

// 计算应付总额
function computePayable() {
    var money = (parseFloat(settlement.total) + parseFloat(settlement.yf) + parseFloat(settlement.sj) - parseFloat(settlement.yhq) - parseFloat(settlement.jf) - parseFloat(settlement.hdjr)).toFixed(2);
    return money > 0 ? money : 0.01
}

// 选择订单参加的活动
function selectActivity() {
    settlement.hdid = $(this).val();
    var tp = $(this).children('option:selected').attr('data-tp');
    var ex = parseFloat($(this).children('option:selected').attr('data-ex'));
    switch (tp) {
        case '0' :
            settlement.hdjr = settlement.total - settlement.total * ex / 100;
            break;
        case '1':
            settlement.hdjr = ex;
            break;
        case '2':
            settlement.hdjr = 0;
            var js = parseFloat($('#_co_zsjf').html());
            $('#_co_zsjf').html(js * ex);
            break;
        case '4':
            settlement.hdjr = settlement.yf;
            break;
        default:
            settlement.hdjr = 0;
            break;
    }
    // 调用应付计算
    $('#_co_yf').html(computePayable())
}

// 省市县dom处理
function disposeRegion(val, data) {
    // var html = '';
    var html = '<option value="">请选择地址</option>';
    for (var i = 0, len = data.length; i < len; i++) {
        // html += '<option value="' + data[i].id + '">' + data[i].name + '</option>'
        html += '<option value="' + data[i].id + '" ' + (data[i].id === ssx.province_id ? "selected" : "") + '>' + data[i].name + '</option>'
    }
    switch (val) {
        case 0:
            // $('#province').html('<option value="">请选择</option>' + html);
            $('#province').html(html);
            break;
        case 1:
            // $('#city').html('<option value="">请选择</option>' + html);
            $('#city').html(html);
            $('#county').html('<option value="">请选择</option>').val('');
            break;
        case 2:
            // $('#county').html('<option value="">请选择</option>' + html);
            $('#county').html(html).val('');
            break;
    }
    $('#province').val(addres.pid);
}

// 选择省请求市
$('#province').change(function () {
    addres.pid = $(this).val();
    getRegion(1, $(this).val());
});

// 选择市请求区
$('#city').change(function () {
    getRegion(2, $(this).val())
});