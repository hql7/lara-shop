//APP下载二维码
$('.app_img').attr('src', getApi('web/app_download_qr?k=' + Math.random() + ''));

// 登陆状态
if (getobjS('user')) {
    // 登陆状态
    var str = '<a href="user.html">' + getobjS('user').name + '</a><a onclick="logOut()" href="###">退出</a>';
    $('._h-shortcut .w strong').html(str);
    // 购物车
    $.ajax({
        url: getApi('web/carts'),
        type: 'post',
        data: {user_id: getobjS('user').id, token: getobjS('user').token},
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                $('._u-h-cat').html(res.nums)
            }
        },
        error: function (err) {
        }
    })
} else {
    location.href = 'login.html'
}

// 搜索
function _u_search() {
    var keyword = $('._u-search');
    if (keyword.val()) {
        // 清除搜索缓存后搜索
        clearSearch();
        location.href = 'search.html?k=' + keyword.val() + ''
    } else {
        keyword.focus();
        _msg({msg: '请输入搜索关键词'})
    }
}

// 账户设置
function sysAccount(th) {
    var a = $(th).val();
    switch (a) {
        case '0':
            location.href = 'user-info.html';
            break;
        case '1':
            location.href = 'account-bind.html';
            break;
        case '2':
            location.href = 'address.html';
            break;
        case '3':
            location.href = 'account-safe.html';
            break;
        default:
    }
}

// 商城logo 个人中心区
systemLogo('.site-logo', true);