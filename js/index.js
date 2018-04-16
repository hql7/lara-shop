// 首页设定
/*(function () {
    // 购物车数量
    var car_num = getobjS('user') ? getobjS('user').cart_nums : 0;
    $('.ind-cart span').html(car_num);

    // 菜单显示
    $('.menu').css('display', 'block');
}());*/

// 设备查询
if (/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
    location.href = 'http://mobile.lara-shop.cn'
}

// 发送请求
indexBanner();
// 请求商城logo配置项
getSystemConfig('website');

/* 首页请求*/
//---------------------------------------------------

// 轮播图片
function indexBanner() {
    $.ajax({
        url: getApi('web/ad_position'),
        type: 'post',
        data: {
            type: 1
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div class="swiper-slide"><a href="' + res.list[i].link + '" target="_blank"><img src="' + res.list[i].img + '" alt="" title="' + res.list[i].name + '"></a></div>'
                }
                $('#swiper-item-box').html(str);
                // 开启轮播
                var mySwiper = new Swiper('.swiper-container', {
                    loop: true,
                    autoplay: 5000,//可选选项，自动滑动
                    pagination: '.pagination',
                    paginationClickable: true,
                    createPagination: true
                });
                $('#swipePrev').click(function () {
                    mySwiper.swipePrev();
                });
                $('#swipeNext').click(function () {
                    mySwiper.swipeNext();
                })
            }
        },
        error: function (err) {
        }
    }).then(
        timeLimitGoods(),
        indexHotGoods(),
        banRightAd(),
        indexNotice(),
        indexHotGoodsAd(),
        indexADcard()
    );
}

// 轮播右侧广告
function banRightAd() {
    $.ajax({
        url: getApi('web/ad_position'),
        type: 'post',
        data: {
            type: 6
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div class="swiper-slide"><a href="' + res.list[i].link + '" target="_blank"><img src="' + res.list[i].img + '" alt="" title="' + res.list[i].name + '"></a></div>'
                }
                $('#swiper-item-box-right').html(str);
                // 开启轮播
                var rightSwiper = new Swiper('#switch-right', {
                    loop: true,
                    autoplay: 50000, //可选选项，自动滑动
                    pagination: '.info-pagination'
                    // paginationClickable: true
                });
            }
        },
        error: function (err) {
        }
    });
}

// 热卖商品广告
function indexHotGoodsAd() {
    $.ajax({
        url: getApi('web/ad_position'),
        type: 'post',
        data: {
            type: 5
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<a href="' + res.list[i].link + '" target="_blank"><img src="' + res.list[i].img + '" alt="' + res.list[i].name + '" title="' + res.list[i].name + '"></a>'
                }
                $('#hot-tui-guang').html(str);
            }
        },
        error: function (err) {
        }
    });
}

// 热卖商品下方广告条
function indexADcard() {
    $.ajax({
        url: getApi('web/ad_position'),
        type: 'post',
        data: {
            type: 7
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<a href="' + res.list[i].link + '" target="_blank"><img src="' + res.list[i].img + '" alt="" title="' + res.list[i].name + '"></a>'
                }
                $('#ind-ad').html(str);
            }
        },
        error: function (err) {
        }
    });
}

// 获取公告
function indexNotice() {
    $.ajax({
        url: getApi('web/notice'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.notice = res.notice || [];
                var str1 = '', str2 = '';
                for (var i = 0, len = res.notice.length; i < len; i++) {
                    str1 += '<li><a href="help.html?h=0&aid=' + res.notice[i].id + '" target="_blank">' + res.notice[i].title + '</a></li>'
                }
                $('#ind-notice').html(str1);
            }
        },
        error: function (err) {
        }
    });
}

// 限时抢购轮播图片
function timeLimitGoods() {
    $.ajax({
        url: getApi('web/flash_sale'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                if (res.list.length > 0) {
                    var str = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        str += '<div class="swiper-slide good-box"><a href="goods.html?id=' + res.list[i].id + '">' +
                            '<div class="ind-sel-img"><img src="' + res.list[i].img + '" alt="good" width="150" height="135"></div>' +
                            '<img src="../imgs/good-img-bottom-show.png" alt="show"><h3 class="c-999">' + res.list[i].name + '</h3>' +
                            '<p><strong  class="c-red">￥<span>' + res.list[i].flash_price + '</span></strong>&nbsp;&nbsp;<s>￥' + res.list[i].sell_price + '</s></p></a></div>'
                    }
                    $('#swiper-box2').html(str);
                    // 开启轮播
                    var mySwiper = new Swiper('.swiper-container2', {
                        autoplay: 5000,//可选选项，自动滑动
                        slidesPerView: 5
                    });
                } else {
                    $('#flash_goods').css('display', 'none')
                }
            }
        },
        error: function (err) {
        }
    });
}

// 热卖商品
function indexHotGoods() {
    $.ajax({
        url: getApi('web/hot_sale'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
                        '<h3>' + res.list[i].name + '</h3><p>￥<span>' + res.list[i].sell_price + '</span></p></a></div>'
                }
                $('#hot-good').html(str)
            }
        },
        error: function (err) {
        }
    }).then(
        floorGoods()
    );
}

// --- 热卖商品广告区 请求暂缺

// 商品分区展示
function floorGoods() {
    $.ajax({
        url: getApi('web/floor_sale'),
        type: 'post',
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str1 = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    var str2 = '', str3 = '', str4 = '';
                    for (var j = 0, len2 = res.list[i].goods.length; j < len2; j++) {
                        str2 += '<div><a href="goods.html?id=' + res.list[i].goods[j].id + '" target="_blank">' +
                            '<img src="' + res.list[i].goods[j].img + '" alt="good">' +
                            '<h3>' + res.list[i].goods[j].name + '</h3><span>￥' + res.list[i].goods[j].sell_price + '</span></a></div>'
                    }
                    for (var k = 0, len3 = res.list[i].categorys.length; k < len3; k++) {
                        str3 += '<li><a href="search.html?cid=' + res.list[i].categorys[k].id + '" target="_blank">' + res.list[i].categorys[k].name + '</a></li>'
                    }
                    for (var n = 0, len4 = res.list[i].brands.length; n < len4; n++) {
                        str4 += '<a href="search.html?bid=' + res.list[i].brands[n].id + '" target="_blank"><img src="' + res.list[i].brands[n].img + '" alt="brand-logo"></a>'
                    }
                    str1 += '<div class="zone-box"><h2>' + res.list[i].floor_name + '<a class="u-right" target="_blank" href="search.html?cid=' + res.list[i].floor_id + '">更多<i class="iconfont icon-you2"></i></a></h2><div class="z-g-box">' +
                        '<div class="z-g-left"><a href="' + res.list[i].link + '" target="_blank"><img src="' + res.list[i].img_pc + '" alt="' + res.list[i].floor_name + '" title="' + res.list[i].floor_name + '"></a><ul>' + str3 + '</ul></div>' +
                        '<div class="z-g-right">' + str2 + '</div>' +
                        '<div class="z-g-bottom">' + str4 + '</div></div></div>'
                }
                $('#ind-zone').html(str1)
            }
        },
        error: function (err) {
        }
    }).then(
        forUGoods()
    );
}

// 猜你喜欢
function forUGoods() {
    $.ajax({
        url: getApi('web/guess_you_like'),
        type: 'post',
        data: {
            type: 0,
            num: 20,
            id: getobjS('user') ? getobjS('user').id : '',
            token: getobjS('user') ? getobjS('user').token : ''
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                res.list = res.list || [];
                var str = '';
                for (var i = 0, len = res.list.length; i < len; i++) {
                    str += '<div><a href="goods.html?id=' + res.list[i].id + '"><img src="' + res.list[i].img + '" alt="good">' +
                        '<h3>' + res.list[i].name + '</h3>' +
                        '<p><i class="c-red">￥' + res.list[i].sell_price + '</i><span class="u-right">评价' + res.list[i].reviews_num + '</span></p></a></div>'
                }
                $('#more-box').html(str)
            }
        },
        error: function (err) {
        }
    });
}

// 商家入驻
$('#seller_in').click(function () {
    _msg({msg: '敬请期待'})
});

// 版本过低提示
(function killIe8() {
    if (!-[1,]) {
        _msg({msg: '您的浏览器版本过低，请使用主流浏览器或极速模式，请升级您的浏览器以保障您流畅的购物体验', time: 5000})
    }
}());