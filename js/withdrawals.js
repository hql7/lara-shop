var userInfo = {
    balance: '', // 余额
    wechat: null, // 微信id
    type: null // 提现方式
}; // 用户信息

getUserInfo();

// ----------------------------提现 请求-------------------------------

// 用户信息请求
function getUserInfo() {
    $.ajax({
        url: getApi('web/user_info'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                // 余额 微信绑定 信息
                userInfo.balance = res.info.balance;
                userInfo.wechat = res.info.wechat;
                $('#_w_ye').html(res.info.balance);
                if (!res.info.wechat) {
                    _msg({msg: '您的账户未绑定微信！'})
                }
            }
        }
    })
}

// 提现申请
function getWithdrawals(resolve, reject) {
    var data = {
        user_id: getobjS('user').id,
        token: getobjS('user').token,
        amount: $('#_m_je').val(),
        type: userInfo.type,
        safepass: $('#_m_ps').val()
        // account_tel: $('#_m_tel').val()
    };
    if (userInfo.type === 0) {
        data.payee_account = $('#_m_zh').val();
        data.payee_real_name = $('#_m_na').val();
    } else {
        data.openid = userInfo.wechat;
        data.re_user_name = $('#_m_na').val();
    }
    $.ajax({
        url: getApi('web/withdraw'),
        type: 'post',
        data: data,
        dataType: 'jsonp',
        success: function (res) {
            resolve(res);
            $('._wit_btn').attr('disabled', false);
            loginOverdue(res.code);
            // _msg({msg: res.msg});
            if (res.code === 0) {
                setInterval(function () {
                    location.href = 'account-balance.html';
                }, 2000);
            }
        },
        error: function (err) {
            reject(err);
            $('._wit_btn').attr('disabled', false);
            // _msg({msg: '请重试'});
        }
    })
}

// ----------------------------提现 功能-------------------------------

// 选择提现方式
function choseWitType(val) {
    userInfo.type = val;
    if (val === 1 && !userInfo.wechat) {
        _msg({msg: '您的账户未绑定微信！'});
        $('#_zh').css('display', 'none')
    } else {
        $('#_zh').css('display', '')
    }
}

// 表单验证
function vada(th) {
    $('#witForm').validate({
        rules: {
            _m_je: {
                required: true,
                min: 100,
                digits: true
            },
            _w_tp: {
                required: true
            },
            _m_zh: {
                required: true
            },
            _m_na: {
                required: true
            },
            _m_ps: {
                required: true,
                password: true
            }
        },
        messages: {
            _w_tp: '请选择提现方式'
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.css({
                width: '240px',
                color: '#dd2525',
                paddingLeft: '195px'
            });
            error.appendTo(element.closest('li'));
        },
        errorElement: "p",
        submitHandler: function () {
            // 禁用按钮
            $(th).attr('disabled', true);
            antiShakeObj.antiShake(getWithdrawals);
            // getWithdrawals(th)
        }
    })
}