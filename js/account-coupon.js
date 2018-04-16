var coupon = {
    type: 0, // 类型  0=全部类型  其他待定
    status: 0 // 优惠券状态   0=未使用  1=已使用  2=已失效
}; // 优惠券参数
var page = {
    index: 1,
    total: 1,
    size: 10
}; // 分页

getCouponList();

//-----------------------我的优惠券 请求---------------------------

// 我的券列表
function getCouponList() {
    $.ajax({
        url: getApi('web/my_voucher'),
        type: 'post',
        data: {
            index: page.index,
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            type: coupon.type,
            status: coupon.status
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
                $('#cou_box').html(couponHtml(res.list))
            }
        }
    })
}

// 激活代金券 - 请求
function toActCou(lay, th) {
    $.ajax({
        url: getApi('web/voucher_active'),
        type: 'post',
        data: dafa({
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            account: $('#con_act').val(),
            password: $('#con_pas').val()
        }),
        dataType: 'jsonp',
        success: function (res) {
            $(th).attr('disabled', false);
            lay.msg(res.msg);
            lay.closeAll();
            if (res.code === 0) {
                getCouponList()
            }
        },
        error: function (err) {
            $(th).attr('disabled', false);
            lay.msg('网络链接失败！请重试');
            lay.closeAll();
        }
    })

}

//-----------------------我的优惠券 功能---------------------------

// 选择优惠券类型
function changeCouponType(th) {
    coupon.type = $(th).val();
    getCouponList();
}

// 选择优惠券状态
function changeCouponStatus(th) {
    coupon.status = $(th).val();
    getCouponList();
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
                    getCouponList();
                }
            }
        });
    });
}

// 优惠券列表html
function couponHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<div><div class="_top"><p><sup>￥</sup>' +
            '<em>' + data[i].value + '</em><b>券</b></p>' +
            '<h4>满' + data[i].money + '可用</h4>' +
            '<p><b>' + data[i].start_time + '-' + data[i].end_time + '</b></p></div>' +
            '<div class="_bottom"><h3><label>限品类：</label><span>' + data[i].condition + '</span></h3>' +
            '<h3><label>券编号：</label><span>' + data[i].account + '</span></h3>' +
            '<p>' + couponStatusHtml(data[i].status, data[i].id) + '</p></div></div>'
    }
    return html
}

// 优惠券状态
function couponStatusHtml(data, id) {
    var sta = '';
    switch (data) {
        case 0:
            sta = '<a href="search.html?qid=' + id + '">立即使用</a>';
            break;
        case 1:
            sta = '<a class="_no" ">已使用</a>';
            break;
        case 2:
            sta = '<a class="_no" ">已失效</a>';
            break;
    }
    return sta
}

// 弹出激活代金券
function activaCon(th) {
    $(th).attr('disabled', true);
    layui.use('layer', function () {
        var layer = layui.layer;
        layer.open({
            type: 1,
            content: $('#act_con_pop') //这里content是一个DOM，注意：最好该元素要存放在body最外层，否则可能被其它的相对元素所影响
            , title: '激活优惠券'
            , area: '500px'
            , btn: ['确定', '取消']
            , yes: function (index, layero) {
                //按钮【按钮一】的回调
                var con_act = $('#con_act').val();
                var con_pas = $('#con_pas').val();
                if (!con_act) {
                    layer.msg('请输入优惠券账号')
                } else if (!con_pas) {
                    layer.msg('请输入优惠券密码')
                } else {
                    layer.load(1, {shade: false});
                    toActCou(layer, th)
                }
            }
            , btn2: function (index, layero) {
                //按钮【按钮二】的回调
                $(th).attr('disabled', false);
            },
            cancel: function (index, layero) {
                $(th).attr('disabled', false);
                layer.close(index);
                return false;
            }
        });
    });
}