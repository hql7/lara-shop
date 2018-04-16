getUserdetail();

// --------------------------账户安全 请求------------------------
function getUserdetail() {
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
                // 会员信息
                if (res.info.head_pic) {
                    $('#photo').attr('src', res.info.head_pic);
                }
                $('#name').html(res.info.name);
                $('#lv').html(res.info.vip);
                $('#safe_lv').html(safeLv(res.info.safe_level));
                $('#email').html(res.info.email);
                $('#phone').html(res.info.mobile);
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// --------------------------账户安全 功能------------------------

// 安全级别
function safeLv(lv) {
    var html = '';
    switch (lv) {
        case 1:
            html = '较弱';
            break;
        case 2:
            html = '一般';
            break;
        case 3:
            html = '较高';
            break;
        case 4:
            html = '极高';
            break;
    }
    return html
}
