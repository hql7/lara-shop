var product_id = '';
var good_id = '';
var inventory = 1; // 每个货号的库存存储
var layer;
var evaluate = {
    index: 1, // 当前索引页
    type: 0, // 类型 0=全部评价  1=有图  2=好评  3=中评  4=差评  5=当前商品评价
    sort: 0, // 排序方式 0=推荐排序(点赞数)  1=时间排序(倒序)
    pid: '' // 如果type为5 请求货号id
};
var page = {
    index: 1, // 索引页
    size: 10,
    total: 1 // 总页
}; // 数据信息

// 是否登陆收集足迹 收藏
if (getobjS('user')) {
    collectingFootprints();
}

// 商品详情页 请求 ---------------------------------
sendYouLike(); // 猜你喜欢
lookTrack(); // 看了又看
goodDetails(); // 商品详情
goodPackage(); // 商品优惠套餐
newArrival(); // 新品上市

// 商品详情
function goodDetails() {
    $.ajax({
        url: getApi('web/good_detail'),
        type: 'post',
        data: {
            user_id: getobjS('user') ? getobjS('user').id : '',
            token: getobjS('user') ? getobjS('user').token : '',
            good_id: getSearch().id,
            product_id: product_id
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                //货号id
                product_id = res.good_info.product_id;
                good_id = res.good_info.id;
                // 默认图片
                $('.img_L').attr('src', res.good_info.img);
                // 小图片列表
                var str = '';
                for (var i = 0, len = res.good_info.imgs.length; i < len; i++) {
                    str += '<img class="img_S" src="' + res.good_info.imgs[i] + '">'
                }
                $('.img_s_box').html(str);
                // 标题
                $('#good_form > h2').html(res.good_info.name);
                // 副标题
                $('#good_form > h3').html(res.good_info.subtitle);
                // 累计评价
                $('#all_pj').html(res.good_info.reviews_num);
                // 不同活动
                var hd = $('#g_p-activity'); // 活动盒子
                var yj = $('#good_form .j_q_y s'); // 原价盒子
                var xj = $('#good_form .j_q_x'); // 现价盒子
                switch (res.good_info.type) {
                    case 0:
                        hd.css('display', 'none');
                        // 原价
                        yj.html('￥' + res.good_info.market_price);
                        // 现价
                        xj.html('<label>商城价</label><span>￥' + res.good_info.sell_price + '</span>');
                        break;
                    case 1:
                        hd.css('display', '').find('em').html('团购');
                        // 原价
                        yj.html('￥' + res.good_info.sell_price);
                        // 团购价
                        xj.html('<label>团购价</label><span>￥' + res.good_info.sale_price + '</span>');
                        // TimeClose(res.good_info.end_time, '#g_p-yhj');
                        getRTime(res.good_info.end_time, '#g_p-yhj');
                        break;
                    case 2:
                        hd.css('display', '').find('em').html('限时抢购');
                        // 原价
                        yj.html('￥' + res.good_info.sell_price);
                        // 抢购价
                        xj.html('<label>抢购价</label><span>￥' + res.good_info.sale_price + '</span>');
                        // TimeClose(res.good_info.end_time, '#g_p-yhj');
                        getRTime(res.good_info.end_time, '#g_p-yhj');
                        break;
                    case 3:
                        hd.css('display', '').find('em').html('商品促销').next('strong').html(res.good_info.sale_desc);
                        if (res.good_info.prom_type == 3 || res.good_info.prom_type == 4) {
                            yj.html('￥' + res.good_info.market_price);
                            xj.html('<label>促销价</label><span>￥' + res.good_info.sell_price + '</span><b>' + res.good_info.prom_desc + '</b>')
                        } else {
                            yj.html('￥' + res.good_info.sell_price);
                            xj.html('<label>促销价</label><span>￥' + res.good_info.sale_price + '</span>')
                        }
                        break;
                    case 4:
                        hd.css('display', '').find('em').html('积分换购');
                        xj.html('<label>所需积分</label><span>￥' + res.good_info.point + '</span>')
                }
                // 规格
                var str2 = '';
                for (var j = 0, len1 = res.good_info.specs.length; j < len1; j++) {
                    var str3 = '';
                    for (var k = 0, len2 = res.good_info.specs[j].value.length; k < len2; k++) {
                        str3 += '<span id="' + res.good_info.specs[j].value[k].id + '">' + res.good_info.specs[j].value[k].name + '</span>';
                    }
                    str2 += '<li><label id="' + res.good_info.specs[j].id + '">' + res.good_info.specs[j].name + '</label><strong>' + str3 + '</strong></li>'
                }
                $('#good_form > ul').html(str2);
                // 默认规格
                // defaultSpec(res.good_info.now_spec);
                // 库存
                $('#num_kc').html(res.good_info.store_nums);
                // 记录库存
                inventory = parseInt(res.good_info.store_nums);
                if (inventory > 0) {
                    $('.can_buy').css('display', 'block');
                    $('.cant_buy').css('display', 'none');
                } else {
                    $('.can_buy').css('display', 'none');
                    $('.cant_buy').css('display', 'block');
                }
                // 面包屑导航
                $('#g_crumb').html(showCrumb(res.bread_nav));
                // 详情信息
                $('#g_description').html(utf8to16(base64decode(res.good_info.detail)));
                // 规格参数
                var str4 = '';
                for (var n in res.good_info.spec_attr) {
                    str4 += '<li><label>' + n + '</label><span>' + res.good_info.spec_attr[n] + '</span></li>'
                }
                $('#g_parameter ul').html(str4);
                // 售后保障
                $('#g_after-sale').html(utf8to16(base64decode(res.good_info.after_sale)));
                // 小图转大图
                $('.img_S').mouseenter(function () {
                    $(this).css('borderColor', '#ff4000').siblings('img').css('borderColor', '');
                    $('.img_L').attr('src', $(this).attr('src'));
                });
            } else {
                _msg({msg: res.msg});
                setInterval(function () {
                    history.href = 'index.html'
                }, 2000)
            }
        },
        error: function (err) {
            // num++;
            // if (num < 3) {
            //     // goodsDetails()
            // }
        }
    })
}

// 货号详情
function goodProduct() {
    // 处理规格格式
    var str = '', SPLI = $('#g_spec_box li');
    for (var i = 0, len = SPLI.length; i < len; i++) {
        str += SPLI.eq(i).attr('id') + ';'
    }
    var spec = str.substr(0, str.length - 1);
    // 发起货号请求
    $.ajax({
        url: getApi('web/product_detail'),
        type: 'post',
        data: {
            good_id: getSearch().id,
            spec: spec
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                // _msg({msg: res.msg});
                product_id = res.info.product_id;
                // 不同活动
                var hd = $('#g_p-activity'); // 活动盒子
                var yj = $('#good_form .j_q_y s'); // 原价盒子
                var xj = $('#good_form .j_q_x'); // 现价盒子
                switch (res.info.type) {
                    case 0:
                        hd.css('display', 'none');
                        // 原价
                        yj.html('￥' + res.info.market_price);
                        // 现价
                        xj.html('<label>商城价</label><span>￥' + res.info.sell_price + '</span>');
                        break;
                    case 1:
                        hd.css('display', '').find('em').html('团购');
                        // 原价
                        yj.html('￥' + res.info.sell_price);
                        // 团购价
                        xj.html('<label>团购价</label><span>￥' + res.info.sale_price + '</span>');
                        break;
                    case 2:
                        hd.css('display', '').find('em').html('限时抢购');
                        // 原价
                        yj.html('￥' + res.info.sell_price);
                        // 抢购价
                        xj.html('<label>抢购价</label><span>￥' + res.info.sale_price + '</span>');
                        break;
                    case 3:
                        hd.css('display', '').find('em').html('商品促销').find('strong').html(res.info.sale_desc);
                        if (res.info.prom_type == 3 || res.info.prom_type == 4) {
                            yj.html('￥' + res.info.market_price);
                            xj.html('<label>促销价</label><span>￥' + res.info.sell_price + '</span><b>' + res.info.prom_desc + '</b>')
                        } else {
                            yj.html('￥' + res.info.sell_price);
                            xj.html('<label>促销价</label><span>￥' + res.info.sale_price + '</span>')
                        }
                        break;
                    case 4:
                        hd.css('display', '').find('em').html('积分换购');
                        xj.html('<label>所需积分</label><span>￥' + res.info.point + '</span>')
                }
                // 库存
                $('#num_kc').html(res.info.store_nums);
                // 记录库存
                inventory = parseInt(res.info.store_nums);
                if (inventory > 0) {
                    $('.can_buy').css('display', 'block');
                    $('.cant_buy').css('display', 'none');
                } else {
                    $('.can_buy').css('display', 'none');
                    $('.cant_buy').css('display', 'block');
                }
                // 规格参数
                var str4 = '';
                for (var n in res.info.spec_attr) {
                    str4 += '<li><label>' + n + '</label><span>' + res.info.spec_attr[n] + '</span></li>'
                }
                $('#g_parameter ul').html(str4);
            }
        },
        error: function (err) {
        }
    })
}

// 优惠套餐
function goodPackage() {
    $.ajax({
        url: getApi('web/bundling_goods'),
        type: 'post',
        data: {id: getSearch().id},
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                var box = $('.g_pk-box');
                var str = '', index = 0;
                if (res.info) {
                    $('.g_package').css('display', 'block');
                    for (var i = 0, len = res.info.length; i < len; i++) {
                        var str1 = '';
                        for (var j = 0, len1 = res.info[i].other_goods.length; j < len1; j++) {
                            str1 += '<div class="swiper-slide"><a href="goods.html?id=' + res.info[i].other_goods[j].id + '">' +
                                '<img src="' + res.info[i].other_goods[j].img + '" alt="good"><h3>' + res.info[i].other_goods[j].name + '</h3>' +
                                '<p>￥' + res.info[i].other_goods[j].sell_price + '</p></a></div>'
                        }
                        str += '<div class="pk-good"><a href="goods.html?id=' + res.info[i].current_goods.id + '">' +
                            '<img src="' + res.info[i].current_goods.img + '" alt="good"><h3>' + res.info[i].current_goods.name + '</h3>' +
                            '<p>￥' + res.info[i].current_goods.sell_price + '</p></a></div><div class="pk-plus"><i class="iconfont icon-iconjia"></i>' +
                            '</div><div class="pk-tc"><div class="btn-prv pk-btn btn-prv' + i + '"><i class="iconfont icon-right1"></i></div>' +
                            '<div class="pk-swi swiper-container' + i + '"><div class="swiper-wrapper swi-box">' + str1 + '</div></div>' +
                            '<div class="btn-nex pk-btn btn-nex' + i + '"><i class="iconfont icon-you"></i></div></div>' +
                            '<div class="pk-plus"><i class="iconfont icon-dengyu"></i></div>' +
                            '<div class="pk-pri"><h3>' + res.info[i].title + '</h3><p>原价<s>￥' + res.info[i].total_price + '</s></p>' +
                            '<p>套餐价<em>￥' + res.info[i].price + '</em></p><a href="cart.html">立即购买</a></div>'

                    }
                    // 插入文档
                    box.html(str);
                    // 声明多个swiper实例
                    for (var k = 0, len5 = res.info.length; k < len5; k++) {
                        var mySwiper = new Swiper('.swiper-container' + k + '', {
                            slidesPerView: 5,
                            slidesPerGroup: 5,
                            onlyExternal: true
                        });
                        $('.btn-prv' + k + '').click(function () {
                            mySwiper.swipePrev();
                        });
                        $('.btn-nex' + k + '').click(function () {
                            mySwiper.swipeNext();
                        });
                    }
                } else {
                    $('.g_package').css('display', '')
                }
            }
        }
    })
}

// 商品评价
function goodEvaluate(option) {
    $.ajax({
        url: getApi('web/good_reviews'),
        type: 'post',
        data: {
            index: option.index,
            type: option.type,
            sort: option.sort,
            good_id: getSearch().id,
            product_id: option.pid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                page.total = res.fy_count;
                page.size = res.fy_pgSize;
                if (res.fy_pgCur === 1) {
                    layuiPage();
                }
                // 好评率
                $('.g_e_rate').html(res.reviews_info.favorable_rate);
                // 各评价数
                var g_e_li = $('.g_e_card li');
                g_e_li.eq(0).find('span').html(res.reviews_info.total_nums);
                g_e_li.eq(1).find('span').html(res.reviews_info.img_nums);
                g_e_li.eq(2).find('span').html(res.reviews_info.high_nums);
                g_e_li.eq(3).find('span').html(res.reviews_info.middle_nums);
                g_e_li.eq(4).find('span').html(res.reviews_info.bad_nums);
                // 评价列表
                $('#g_e_box').html(evaListHtml(res.list));
                // 挂载评分插件
                mountData(res.list);
            }
        }
    })
}

// 新品上市
function newArrival() {
    $.ajax({
        url: getApi('web/new_goods'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                if (res.list) {
                    var str = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        str += '<div><a href="goods.html?id=' + res.list[i].id + '">' +
                            '<img src="' + res.list[i].img + '" alt="good">' +
                            '<h3>' + res.list[i].name + '</h3>' +
                            '<p>￥' + res.list[i].sell_price + '</p></a></div>'
                    }
                    $('.dt-onn-box').html(str)
                }
            }
        },
        error: function (err) {
        }
    })
}

// 猜你喜欢
function sendYouLike() {
    var id = getobjS('user') ? getobjS('user').id : '';
    var token = getobjS('user') ? getobjS('user').token : '';
    $.ajax({
        url: getApi('web/guess_you_like'),
        type: 'post',
        data: {
            type: 0,
            num: 12,
            user_id: id,
            token: token
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                if (res.list) {
                    var str = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
                            '<h3>' + res.list[i].name + '</h3><h4>￥' + res.list[i].sell_price + '</h4>' +
                            '<p><span>' + res.list[i].reviews_num + '</span>人评价</p></a></div>'
                    }
                    $('.s_like_box').html(str)
                }
            }
        }
    })
}

// 看了又看
function lookTrack() {
    $.ajax({
        url: getApi('web/similar_commend'),
        type: 'post',
        data: {id: getSearch().id},
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                loginOverdue(res.code);
                if (res.list) {
                    var str = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        str += '<div><a href="goods.html?id=' + res.list[i].id + '">' +
                            '<img src="' + res.list[i].img + '" alt="good"><p>￥' + res.list[i].sell_price + '</p></a></div>'
                    }
                    $('._s_box').html(str)
                }
            }
        },
        error: function (err) {
        }
    })
}

// 商品详情页 功能 ---------------------------

// 详情页选项卡
$('.dt-c-title li').click(function () {
    $(this).css({backgroundColor: '#e4393c', color: '#fff'});
    $(this).siblings('li').css({backgroundColor: '', color: ''});
    $('.dt-c-con > div').eq($(this).index()).css('display', 'block').siblings('div').css('display', '')
}).eq(0).click();

// 评价选项卡
$('.g_e_card li').click(function () {
    $(this).addClass('pj_act').siblings('li').removeClass('pj_act');
    evaluate.type = $(this).index();
    if (evaluate.type === 5) {
        evaluate.pid = product_id
    } else {
        evaluate.pid = ''
    }
    goodEvaluate(evaluate)
}).eq(0).click();

// 选择规格
$('#g_spec_box').on('click', 'span', function () {
    var spec_kid = $(this).parent().siblings('label').attr('id');
    var spec_vid = $(this).attr('id');
    $(this).addClass('spec_act').closest('li').attr('id', spec_kid + ':' + spec_vid);
    $(this).siblings('span').removeClass('spec_act');
    // 如规格选择完毕 发起货号请求
    if (specRule()) {
        // _msg({msg: '请稍后'});
        goodProduct()
    }
});

// 规格校验
function specRule() {
    var SR = 0, SPLI = $('#g_spec_box li');
    for (var i = 0, len = SPLI.length; i < len; i++) {
        if (!SPLI.eq(i).attr('id')) {
            SR++
        }
    }
    return SR === 0 ? true : false
}

// 登陆校验
function isLogin(val, th) {
    if (!getobjS('user')) {
        // 激活layui组件
        layui.use('layer', function () {
            layer = layui.layer;
            layer.open({
                type: 1,
                title: '请登录',
                content: $('#is_login'),
                area: ['384px']
            })
        });
    } else {
        switch (val) {
            case 1:
                toBuy(th);
                break;
            case 2:
                addCart(th);
                break;
            case 3:
                addStore(th);
                break;
        }
    }
}

// 数量校验
function isNum() {
    var rsg = /^[1-9][0-9]*$/.test($('#buy_num_').val());
    if (!rsg) {
        $('#buy_num_').val(1);
        return false
    }
    var num = parseInt($('#buy_num_').val());
    if (num > inventory) {
        $('#buy_num_').val(inventory);
        return false
    }
}

// 数量加
function addNum() {
    var num = parseInt($('#buy_num_').val());
    if (num < inventory) {
        num++;
    }
    $('#buy_num_').val(num)
}

// 数量减
function minusNum() {
    var num = $('#buy_num_').val();
    if (num > 1) {
        num--
    }
    $('#buy_num_').val(num)
}

// 加入购物车
function addCart(th) {
    var num = $('#buy_num_').val();
    if (!specRule()) {
        _msg({msg: '请选择规格'})
    } else if (inventory < 1) {
        _msg({msg: '库存不足'})
    } else {
        $(th).attr('disabled', true);
        $.ajax({
            url: getApi('web/add_cart'),
            type: 'post',
            data: {
                user_id: getobjS('user').id,
                token: getobjS('user').token,
                product_id: product_id,
                num: num
            },
            dataType: 'jsonp',
            success: function (res) {
                $(th).attr('disabled', false);
                loginOverdue(res.code);
                if (res.code === 0) {
                    getCartNum();
                    _msg({msg: res.msg})
                } else {
                    _msg({msg: res.msg})
                }
            },
            error: function (err) {
                _msg({msg: '请重试'});
                $(th).attr('disabled', false);
            }
        })
    }
}

// 立即购买
function toBuy(th) {
    if (!specRule()) {
        _msg({msg: '请选择规格'})
    } else if (inventory < 1) {
        _msg({msg: '库存不足'})
    } else {
        $(th).attr('disabled', true);
        var data = dafa({
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            param: [{
                good_id: getSearch().id,
                product_id: product_id,
                num: $('#buy_num_').val()
            }]
        });
        $.ajax({
            url: getApi('web/order_ready'),
            type: 'post',
            data: data,
            dataType: 'jsonp',
            success: function (res) {
                $(th).attr('disabled', false);
                loginOverdue(res.code);
                if (res.code === 0) {
                    location.href = 'confirm-order.html'
                } else {
                    _msg({msg: res.msg})
                }
            },
            error: function (err) {
                _msg({msg: '请重试'});
                $(th).attr('disabled', false);
            }
        })
    }
}

// 登陆验证码
$('.yzm-img').click(function () {
    $(this).attr('src', getApi('coms/user-code?k=' + Math.random() + ''))
}).click();

// 登陆表单验证
function vada() {
    $('#pop_login').validate({
        rules: {
            log_name: {
                required: true,
                account: true
            },
            log_pass: {
                required: true,
                password: true
            },
            log_code: {
                required: true,
                rangelength: [5, 5]
            }
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.parent());
        },
        errorElement: "em",
        submitHandler: function () {
            http_()
        }
    })
}

// 登陆请求
function http_() {
    var data = {
        username: $('.log_name').val(),
        userpass: $('.log_pass').val(),
        yzm: $('.log_code').val()
    };

    $.ajax({
        url: getApi('web/login'),
        type: 'post',
        data: dafa(data),
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                // 关闭登陆弹出
                layer.closeAll();
                // 储存信息
                setobjS('user', res.info);
                // 登录改变顶部信息
                loginUser();
                // 收集足迹
                collectingFootprints();
            } else {
                $('.yzm-img').click()
            }
        },
        error: function (err) {
            $('.yzm-img').click()
        }
    })
}

// 收集足迹
function collectingFootprints() {
    $.ajax({
        url: getApi('web/visit_log'),
        type: 'post',
        data: {
            good_id: getSearch().id,
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp'
    })
}

// 加入收藏
function addStore(th) {
    $.ajax({
        url: getApi('web/add_attention'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            good_id: good_id,
            product_id: product_id
        },
        dataType: 'jsonp',
        success: function (res) {
            _msg({msg: res.msg})
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}

// 默认规格
function defaultSpec(data) {
    var arr1 = data.split(';');
    var arr3 = null, arr4 = null, arr5 = {};
    for (var i = 0; i < arr1.length; i++) {
        arr3 = arr1[i];
        arr4 = arr3.split(':');
        arr5[arr4[0]] = arr4[1];
    }
    return arr5;
}

// 评价列表HTML
function evaListHtml(data) {
    var str = '';
    for (var i = 0, len = data.length; i < len; i++) {
        var str1 = '', str2 = '';
        for (var j = 0, len2 = data[i].imgs.length; j < len2; j++) {
            str1 += '<img src="' + data[i].imgs[j] + '" alt="tx" onclick="seeEvaImg(this)">'
        }
        if (data[i].reply) {
            str2 = '<div class="shop_reply"><h4>商家' + data[i].reply_admin + '回复：</h4>' +
                '<p>' + data[i].reply + '</p> + <p>' + data[i].reply_time + '</p></div>'
        }
        str += '<div><div class="_e_l"><p><img src="' + data[i].head_pic + '" alt=""><span></span></p>' +
            '<h3>' + data[i].username + '</h3><h4>' + data[i].vip + '</h4></div>' +
            '<div class="_e_r"><p>评分星级 <div class="star" id="star' + i + '" data-score="' + data[i].point + '"></div></p>' +
            '<h3>' + data[i].content + '</h3><div class="_e_s_img">' + str1 + '</div><div class="b_img_box" onclick="closeEvaImg(this)"></div>' +
            '<p><span>' + data[i].spec_str + '</span><span>' + data[i].comment_time + '</span></p>' + str2 + '</div></div>'
    }
    return str
}

// 点击查看大图
function seeEvaImg(th) {
    $(th).parent('div').next('.b_img_box').css('display', 'block')
        .html('<img src="' + $(th).attr("src") + ' ">')
}

// 缩回小图
function closeEvaImg(th) {
    $(th).css('display', 'none')
}

// 面包屑导航HTML
function showCrumb(data) {
    var html = '';
    if (data.c1_name) {
        html += '<a href="search.html?cid=' + data.c1_id + '">' + data.c1_name + '</a> >'
    }
    if (data.c2_name) {
        html += '<a href="search.html?cid=' + data.c2_id + '">' + data.c2_name + '</a> >'
    }
    if (data.c3_name) {
        html += '<a href="search.html?cid=' + data.c3_id + '">' + data.c3_name + '</a> >'
    }
    if (data.b_name) {
        html += '<a href="search.html?cid=' + data.b_id + '">' + data.b_name + '</a> >'
    }
    html += '<a class="name_a" href="">' + data.g_name + '</a>'
    return html
}

// 激活评分插件
function openStar(e, ind) {
    $('#star' + e + '').raty({
        path: "../star/img",
        hints: ['差劲', '失望', '一般', '喜欢', '极好'],
        readOnly: true,
        score: function () {
            return $(this).attr('data-score');
        }
    });
}

// 挂载插件和数据
function mountData(data) {
    for (var i = 0, len = data.length; i < len; i++) {
        // 激活评分插件
        openStar(i);
    }
}

// 激活分页插件
function layuiPage() {
    layui.use('laypage', function () {
        var laypage = layui.laypage;
        //执行一个laypage实例
        laypage.render({
            elem: 'page' //注意，这里的 page 是 ID，不用加 # 号
            , count: page.total //数据总数，从服务端得到
            , theme: '#1E9FFF'
            , limit: page.size
            , jump: function (obj, first) {
                if (!first) { // 首次不执行
                    // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    // console.log(obj.limit); //得到每页显示的条数
                    page.index = obj.curr;
                    // 翻页调用数据请求
                    goodEvaluate();
                    // 定位到顶部
                    $(document).scrollTop(0)
                }
            }
        });
    });
}

// 激活分享插件
(new iShare({
    container: '.iShare1', config: {}
}));

// 显示分享按钮
$('.fx-show').hover(function () {
    $('.fx-box').css('display', 'block')
}, function () {
    $('.fx-box').css('display', 'none')
});