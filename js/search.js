var search = {
    index: 1, // 页码
    total: 1, // 总数
    size: 10,
    keyword: getSearch().k ? getSearch().k : '', // 关键词
    cid: getSearch().cid ? getSearch().cid : '', // 分类名
    brand: getSearch().bid ? getSearch().bid : '', // 所选品牌
    price: '', // 价格区间
    voucher_id: getSearch().qid ? getSearch().qid : '', // 优惠券id
    sort: 0, // 排序方式 0=综合(默认)  1=销量  2=评论数  3=新品  4=价格
    commend: 0, // 推荐商品 是否选中 0=未选中 1=选中
    prom: 0, // 参加活动的商品 是否选中 0=未选中 1=选中
    in_stock: 0 // 仅显示有货 是否选中 0=未选中 1=选中
}; // 搜索页条件信息
var key = false; // 是否更改关键词搜索

SEARCH();

//---------------------- 搜索页脚本 -------------------------

// 搜索条件处理
function conditionalProcessing(sift) {
    if (key) {
        var key_ = $('#keyWord').val() || $('#keyWord').attr('placeholder');
        location.href = 'search.html?k=' + key_ + ''
    } else {
        if (sift.brand) {
            search.brand = sift.brand;
        }
        if (sift.price) {
            search.price = sift.price.replace(/[\u4e00-\u9fa5]/g, '');
        }
        if ('sort' in sift) {
            search.sort = sift.sort;
        }
        if ('commend' in sift) {
            search.commend = sift.commend;
        }
        if ('prom' in sift) {
            search.prom = sift.prom;
        }
        if ('in_stock' in sift) {
            search.in_stock = sift.in_stock;
        }
        search.index = 1;
        SEARCH();
        // 10-18 修复判断对象内是否有某个值时不严谨造成走的if判断出现异常的bug
    }
    // var http = 'k=' + search.keyword + '&cid=' + search.cid + '&bid=' + search.brand + '&pri=' + search.price + '&sor=' + search.sort + '&com=' + search.commend + '&pro=' + search.prom + '&in_s=' + search.in_stock + '';
    // location.href = 'search.html?' + http + ''
}

// 搜索
function SEARCH() {
    $.ajax({
        url: getApi('web/goods_list'),
        type: 'post',
        data: {
            index: search.index,
            keyword: search.keyword || '',
            cid: search.cid,
            brand: search.brand,
            voucher_id: search.voucher_id,
            price: search.price,
            sort: search.sort,
            commend: search.commend,
            prom: search.prom,
            in_stock: search.in_stock
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                if (res.goods) {
                    // 无商品隐藏
                    $('.s_l_none').css('display', '').prev('.s_l_box').css('display', '');
                    // 更新搜索条件数据
                    search.index = res.fy_pgCur;
                    search.total = res.fy_count;
                    search.size = res.fy_pgSize;
                    search.keyword = res.search_info.keyword;
                    search.cid = res.search_info.cid;
                    search.brand = res.search_info.brand;
                    search.price = res.search_info.price;
                    search.sort = res.search_info.sort;
                    search.commend = res.search_info.commend;
                    search.prom = res.search_info.prom;
                    search.in_stock = res.search_info.in_stock;
                    if (res.fy_pgCur === 1) {
                        layuiPage()
                    }
                    // 搜索框
                    $('#keyWord').val(res.search_info.keyword);
                    // 品牌列表 价格列表
                    var str_p = '', str_j = '';
                    for (var i = 0, len = res.brands.length; i < len; i++) {
                        str_p += '<a href="javascript:void(0)" onclick="conditionalProcessing({brand: ' + res.brands[i].id + '})">' + res.brands[i].name + '</a>'
                    }
                    for (var j = 0, len2 = res.price_range.length; j < len2; j++) {
                        str_j += '<a href="javascript:void(0)" >' + res.price_range[j] + '</a>'

                    }
                    str_p ? $('.s_s-p-c').html(str_p) : $('.s_s-p').css('display', 'none');
                    str_j ? $('.s_s-j-c').html(str_j) : $('.s_s-j').css('display', 'none');
                    $('.s_s-j-c >a').click(function () {
                        conditionalProcessing({price: $(this).html()})
                    });
                    // 商品列表
                    var str_g = '';
                    for (var k = 0, len3 = res.goods.length; k < len3; k++) {
                        var str_i = ''; // 多图
                        for (var n = 0, len4 = res.goods[k].imgs; n < len4; n++) {
                            str_i += '<span><img class="s_img_s" src="' + res.goods[k].imgs[n] + '" alt="good_s"></span>'
                        }
                        str_g += '<div><a href="goods.html?id=' + res.goods[k].id + '"><img class="s_img_l" src="' + res.goods[k].img + '" alt="good"></a>' +
                            '<p>' + str_i + '</p><h5>￥' + res.goods[k].sell_price + '</h5>' +
                            '<a href="goods.html?id=' + res.goods[k].id + '"><h3>' + res.goods[k].name + '</h3></a>' +
                            '<h6><span>' + res.goods[k].reviews_num + '</span> 条评价</h6>' +
                            '<h4>' + res.goods[k].shop_name + '<i class="' + (res.goods[k].self_run === 0 ? "iconfont icon-ziying" : "") + '"></i></h4></div>'
                    }
                    $('.s_l_box').html(str_g);
                    // 存参数
                    setobjS('search', res.search_info);
                    // 小图转大图
                    $('.s_img_s').click(function () {
                        $('.s_img_l').attr('src', $(this).attr('src'))
                    })
                } else {
                    $('.s_l_none').css('display', 'block').prev('.s_l_box').css('display', 'none'); // 无商品隐藏
                    $('.s_selector').css('display', 'none')
                }
            }
        },
        error: function (err) {
        }
    });
    // 猜你喜欢
    sendYouLike();
}

// 热销广告
if (getobjS('s_hot')) {
    var res = {list: getobjS('s_hot')};
    var str = '';
    for (var i = 0, len = res.list.length; i < len; i++) {
        str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
            '<h4>￥' + res.list[i].sell_price + '</h4><h3>' + res.list[i].name + '</h3>' +
            '<p>已有人<span>' + res.list[i].reviews_num + '</span>评价</p></a></div>'
    }
    $('.s_hot').append(str);
} else {
    $.ajax({
        url: getApi('web/commend_goods'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            var str = '';
            for (var i = 0, len = res.list.length; i < len; i++) {
                str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
                    '<h4>￥' + res.list[i].sell_price + '</h4><h3>' + res.list[i].name + '</h3>' +
                    '<p>已有人<span>' + res.list[i].reviews_num + '</span>评价</p></a></div>'
            }
            $('.s_hot').append(str);
            setobjS('s_hot', res.list)
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
            num: 6,
            user_id: id,
            token: token
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
                        '<h3>' + res.list[i].name + '</h3><h4>￥' + res.list[i].sell_price + '</h4>' +
                        '<p><span>' + res.list[i].reviews_num + '</span>人评价</p></a></div>'
                }
                $('.s_like_box').html(str)
            }
        }
    })
}

// 参数状态
$('#s_g_p1 a').eq(getSearch().sor).addClass('s_checked').siblings('a').removeClass('s_checked');
// if (getSearch().com === '1') $('#commend').attr('checked', 'checked');
// if (getSearch().pro === '1') $('#prom').attr('checked', 'checked');
// if (getSearch().in_s === '1') $('#in_stock').attr('checked', 'checked');

// 搜索操作
// 是否推荐
$('#commend').change(function () {
    if ($(this).is(':checked')) {
        conditionalProcessing({commend: 1})
    } else {
        conditionalProcessing({commend: 0})
    }
});

// 是否促销
$('#prom').change(function () {
    if ($(this).is(':checked')) {
        conditionalProcessing({prom: 1})
    } else {
        conditionalProcessing({prom: 0})
    }
});

// 是否有货
$('#in_stock').change(function () {
    if ($(this).is(':checked')) {
        conditionalProcessing({in_stock: 1})
    } else {
        conditionalProcessing({in_stock: 0})
    }
});

// 分页插件
function layuiPage() {
    layui.use('laypage', function () {
        var laypage = layui.laypage;
        //执行一个laypage实例
        laypage.render({
            elem: 'page' //注意，这里的 page 是 ID，不用加 # 号
            , count: search.total //数据总数，从服务端得到
            , theme: '#1E9FFF'
            , limit: search.size
            , jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                // console.log(obj.limit); //得到每页显示的条数
                //首次不执行
                if (!first) {
                    //do something
                    search.index = obj.curr;
                    // 翻页调用数据请求
                    SEARCH()
                }
            }
        });
    });
}

// 输入关键词搜索
$('#keyWord').change(function () {
    key = true
});