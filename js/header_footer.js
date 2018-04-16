/*头部和脚部公用请求或方法*/

var stop = true; // 是否可以回到顶部

//-------------------------请求---------------------------

//APP下载二维码
$('.app_img').attr('src', getApi('web/app_download_qr?k=' + Math.random() + ''));

// 热销
hotGoods();

function hotGoods() {
    if (getobjS('hot_key')) {
        var list_ = getobjS('hot_key'), str_ = '';
        for (var j = 0, len1 = list_.length; j < len1; j++) {
            str_ += '<li><a href="search.html?k=' + list_[j] + '">' + list_[j] + '</a></li>'
        }
        $('.ind-sea-box ul').append(str_);
        // 搜索框设定
        var n = Math.floor(Math.random() * list_.length + 1) - 1;
        $('.ind-sea-box input').attr('placeholder', list_[n]);
    } else {
        $.ajax({
            url: getApi('web/hot_keywords'),
            type: 'post',
            dataType: 'jsonp',
            success: function (res) {
                if (res.code === 0) {
                    res.list = res.list || [];
                    var str = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        str += '<li><a href="search.html?k=' + res.list[i] + '">' + res.list[i] + '</a></li>'
                    }
                    $('.ind-sea-box ul').append(str);
                    // 搜索框设定
                    var n = Math.floor(Math.random() * res.list.length + 1) - 1;
                    $('.ind-sea-box input').attr('placeholder', res.list[n]);
                    setobjS('hot_key', res.list)
                }
            },
            error: function (err) {
            }
        });
    }
}


// 横向导航
shopNav();

function shopNav() {
    if (getobjS('nav')) {
        var list = getobjS('nav');
        var str_ = '<li><a href="index.html">首页</a></li>';
        for (var i_ = 0, len = list.length; i_ < len; i_++) {
            str_ += '<li><a href="' + list[i_].link + '" target="' + (list[i_].open_type === 0 ? '_Self' : '_Blank') + ' ">' + list[i_].name + '</a></li>'
        }
        $('.main-nav ul').append(str_)
    } else {
        $.ajax({
            url: getApi('web/nav'),
            type: 'post',
            dataType: 'jsonp',
            success: function (res) {
                if (res.code === 0) {
                    var str = '<li><a href="index.html">首页</a></li>';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        str += '<li><a href="' + res.list[i].link + '" target="' + (res.list[i].open_type === 0 ? '_Self' : '_Blank') + ' ">' + res.list[i].name + '</a></li>'
                    }
                    $('.main-nav ul').append(str);
                    setobjS('nav', res.list)
                }
            },
            error: function (err) {
            }
        })
    }
}


// 导航菜单
shopMenu();

function shopMenu() {
    if (getobjS('menu')) {
        var list = getobjS('menu');
        var str1 = '';
        for (var i = 0, len = list.length; i < len; i++) {
            var str2 = '';
            for (var j = 0, len1 = list[i].childs.length; j < len1; j++) {
                var str3 = '';
                for (var k = 0, len2 = list[i].childs[j].childs.length; k < len2; k++) {
                    str3 += '<a class="menu3" href="search.html?cid=' + list[i].childs[j].childs[k].id + '">' + list[i].childs[j].childs[k].name + '</a>'
                }
                str2 += '<div><h2><a href="search.html?cid=' + list[i].childs[j].id + '">' + list[i].childs[j].name + '</a><i class="iconfont icon-you4 menu-i-right"></i></h2><p>' + str3 + '</p></div>'
            }
            str1 += '<li><a href="search.html?cid=' + list[i].id + '">' + list[i].name + '</a><div class="menu2">' + str2 + '</div></li>'
        }
        $('.menu ul').append(str1)
    } else {
        $.ajax({
            url: getApi('web/category'),
            type: 'post',
            data: {
                type: 0,
                num: 12
            },
            dataType: 'jsonp',
            success: function (res) {
                if (res.code === 0) {
                    res.list = res.list || [];
                    var str1 = '';
                    for (var i = 0, len = res.list.length; i < len; i++) {
                        var str2 = '';
                        for (var j = 0, len1 = res.list[i].childs.length; j < len1; j++) {
                            var str3 = '';
                            for (var k = 0, len2 = res.list[i].childs[j].childs.length; k < len2; k++) {
                                str3 += '<a class="menu3" href="search.html?cid=' + res.list[i].childs[j].childs[k].id + '">' + res.list[i].childs[j].childs[k].name + '</a>'
                            }
                            str2 += '<div><h2><a class="lv2" href="search.html?cid=' + res.list[i].childs[j].id + '">' + res.list[i].childs[j].name + ' </a><i class="iconfont icon-you4 menu-i-right"></i></h2><p>' + str3 + '</p></div>'
                        }
                        str1 += '<li><a href="search.html?cid=' + res.list[i].id + '">' + res.list[i].name + '</a><div class="menu2">' + str2 + '</div></li>'
                    }
                    $('.menu ul').append(str1);
                    setobjS('menu', res.list)
                }
            },
            error: function (err) {
            }
        })
    }
}


// 菜单去搜索 弃用
function menuSearch(id) {
    // 清除缓存后跳转
    clearSearch()
    location.href = 'search.html?cid=' + id + ''
}

// 脚部帮助信息
shopHelp();

function shopHelp() {
    if (getobjS('help')) {
        var res = {help: getobjS('help')};
        var str = '';
        for (var k = 0, len1 = res.help.length; k < len1; k++) {
            var str2 = '';
            for (var j = 0, len2 = res.help[k].child.length; j < len2; j++) {
                str2 += '<p><a href="help.html?h=1&aid=' + res.help[k].child[j].id + '">' + res.help[k].child[j].title + '</a></p>'
            }
            str += '<div><h3><a href="###">' + res.help[k].name + '</a></h3>' + str2 + '</div>'
        }

        $('._f-help').prepend(str)
    } else {
        $.ajax({
            url: getApi('web/help'),
            type: 'post',
            dataType: 'jsonp',
            success: function (res) {
                if (res.code === 0) {
                    res.help = res.help || [];
                    var str = '';
                    for (var k = 0, len1 = res.help.length; k < len1; k++) {
                        var str2 = '';
                        for (var j = 0, len2 = res.help[k].child.length; j < len2; j++) {
                            str2 += '<p><a href="help.html?h=1&aid=' + res.help[k].child[j].id + '">' + res.help[k].child[j].title + '</a></p>'
                        }
                        str += '<div><h3><a href="###">' + res.help[k].name + '</a></h3>' + str2 + '</div>'
                    }
                    $('._f-help').prepend(str);
                    setobjS('help', res.help)
                }
            }
        })
    }
}


// 脚部文件信息
shopWebsite();

function shopWebsite() {
    if (getobjS('website')) {
        var info = getobjS('website')
        var str = 'Copyright © 2016-2025 ' + info.name + ' 版权所有 保留一切权利 备案号:' + info.record_no;
        $('.mod_copyright_auth').before(str);
        $('.site-logo').html('<img src="' + info.logo + '"alt="LOGO">');
        $('._f-hotline h5').html(info.phone)
    } else {
        $.ajax({
            url: getApi('web/config_info'),
            type: 'post',
            data: {title: 'website'},
            dataType: 'jsonp',
            success: function (res) {
                if (res.code === 0) {
                    var str = 'Copyright © 2016-2025 ' + res.info.name + ' 版权所有 保留一切权利 备案号:' + res.info.record_no;
                    $('.mod_copyright_auth').before(str);
                    $('.site-logo').html('<img src="' + res.info.logo + '"alt="LOGO">');
                    $('._f-hotline h5').html(res.info.phone);
                    setobjS('website', res.info);
                }
            },
            error: function (err) {
            }
        })
    }
}


//-------------------------方法---------------------------

/**
 * 回到页面顶部 滑动
 * acceleration 加速度
 * time 时间间隔 (毫秒)
 **/
function goTop(acceleration, time) {
    acceleration = acceleration || 0.5
    time = time || 16

    var x1 = 0
    var y1 = 0
    var x2 = 0
    var y2 = 0
    var x3 = 0
    var y3 = 0

    if (document.documentElement) {
        x1 = document.documentElement.scrollLeft || 0
        y1 = document.documentElement.scrollTop || 0
    }
    if (document.body) {
        x2 = document.body.scrollLeft || 0
        y2 = document.body.scrollTop || 0
    }
    var x3 = window.scrollX || 0
    var y3 = window.scrollY || 0

// 滚动条到页面顶部的水平距离
    var x = Math.max(x1, Math.max(x2, x3))
// 滚动条到页面顶部的垂直距离
    var y = Math.max(y1, Math.max(y2, y3))

// 滚动距离 = 目前距离 / 速度, 因为距离原来越小, 速度是大于 1 的数, 所以滚动距离会越来越小
    var speed = 1 + acceleration
    window.scrollTo(Math.floor(x / speed), Math.floor(y / speed));

// 如果距离不为零, 继续调用迭代本函数
    if ((x > 0 || y > 0) && stop) {
        // disabledMouseWheel();
        var invokeFunction = 'goTop(' + acceleration + ', ' + time + ')';
        setTimeout(invokeFunction, time)
    }
}

// 未滑动到顶部之前鼠标滚动事件
function disabledMouseWheel() {
    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollFunc, false)
    } // W3C
    window.onmousewheel = document.onmousewheel = scrollFunc // IE / Opera / Chrome
}

function scrollFunc(evt) {
    evt = evt || window.event;
    if (evt.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
        if (evt.wheelDelta < 0) { //当滑轮向下滚动时
            // alert("滑轮向下滚动");
            stop = false
        }
    } else if (evt.detail) {  //Firefox滑轮事件
        if (evt.detail < 0) { //当滑轮向下滚动时
            // alert("滑轮向下滚动");
            stop = false
        }
    }
}

// 搜索列表
function search() {
    var search = $('.ind-sea-box input');
    var keyWord = search.val() ? search.val() : search.attr('placeholder') ? search.attr('placeholder') : '';
    location.href = 'search.html?k=' + keyWord + '';
    clearSearch()
}

// 登陆状态
if (getobjS('user')) {
    loginUser()
}

// 登录改变顶部信息
function loginUser() {
    var str = '<a href="user.html">' + getobjS('user').name + '</a><a onclick="logOut()" href="###">退出</a>'
    $('._h-shortcut .w strong').html(str);
    if (getobjS('user').head_pic) {
        var head_pic = getobjS('user').head_pic;
    } else {
        var head_pic = "../imgs/user-avatar.png";
    }
    $('.ind-info .info').html('<img src=' + head_pic + ' alt="用户头像" >' + '<p>Hi，' + getobjS('user').name + '</p>' +
        '<h4><a href="user.html">个人中心</a><a href="message.html">消息中心</a></h4>')
    getCartNum()
}

// 购物车数量
function getCartNum() {
    $.ajax({
        url: getApi('web/carts'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            var car_num = res.nums ? res.nums : 0
            $('.ind-cart span').html(car_num)
        }
    })
}

// 商城logo 首页区
systemLogo('.site-logo');

// 回车搜索事件
/*window.addEventListener('keydown', function (e) {
    console.log(e);
});*/


