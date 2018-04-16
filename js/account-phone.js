getYzm();

//-----------------------绑定验证码 请求------------------------

// 绑定手机
function bingPhone(th) {
    $.ajax({
        url: getApi('web/change_mobile'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            // email_code: $('#em_code').val(),
            // email: $('#new_phone').val()
          mobile: $('#new_phone').val(),
          tel_code: $('#em_code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            $(th).attr('disabled', false);
            if (res.code === 0) {
                location.href = 'account-safe.html'
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

// 发送手机验证码
function getPhoneCode(th) {
    $.ajax({
        url: getApi('coms/mobile_code'),
        type: 'post',
        data: {
            mobile: $('#new_phone').val(),
            img_code: $('#code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg});
                // 别的操作
                // 再次发送定时器
                var timer1, num1 = 120;
                $(th).html(num1 + 's后重新发送');
                timer1 = setInterval(function () {
                    num1--;
                    $(th).html(num1 + 's后重新发送');
                    if (num1 <= 0) {
                        clearInterval(timer1);
                        $(th).attr('disabled', false);
                        $(th).html('发送手机验证码');
                    }
                }, 1000)
            } else {
                _msg({msg: res.msg});
                getYzm();
            }
        },
        error: function (err) {
            _msg({msg: '请重试'});
            getYzm();
        }
    })
}

//-----------------------绑定验证码 功能------------------------

// 图片验证码
function getYzm() {
    $('#yzm_img').attr('src', getApi('coms/user-code?k=' + Math.random() + ''))
}

// 发送手机码验证
function sendPhoneCode(th) {
    if (vP()) {
        // 禁用按钮
        $(th).attr('disabled', true);
        // 请求发送
        getPhoneCode(th);

    } else {
        getYzm();
    }
}

// 手机验证
function vP(form) {
    var ph = $('#new_phone');
    var cd = $('#code');
    var vali = false;
    var reg_ph = /^1[3|4|5|7|8][\d]{9}$/.test(ph.val());
    var reg_cd = /^[\d]{5}$/.test(cd.val());
    if (reg_ph) {
        if (reg_cd) {
            vali = true;
        } else {
            vali = false;
            _msg({msg: '请5位数字验证码'})
        }
    } else {
        vali = false;
        _msg({msg: '请输入正确手机号'})
    }
    return vali;
    /* return form.validate({
         rules: {
             new_phone: {
                 required: true,
                 phone: true
             },
             code: {
                 required: true,
                 rangelength: [5, 5]
             }
         },
         messages: {
             code: "请输入长度为5的数字"
         },
         // 报错信息显示位置
         errorPlacement: function (error, element) {
             error.appendTo(element.parent());
         },
         errorElement: "em"
     });*/
}

// 验证
function vada(th) {
    $('#phone_form').validate({
        rules: {
            new_phone: {
                required: true,
                phone: true
            },
            code: {
                required: true,
                rangelength: [5, 5]
            },
            em_code: {
                required: true,
                rangelength: [6, 6]
            }
        },
        messages: {
            code: "请输入长度为5的数字",
            em_code: "请输入长度为6的数字"
        },
        // 报错信息显示位置
        errorPlacement: function (error, element) {
            error.appendTo(element.parent());
        },
        errorElement: "em",
        submitHandler: function () {
            // 禁用按钮
            $(th).attr('disabled', true);
            // 请求发送
            bingPhone(th)
        }
    })
}