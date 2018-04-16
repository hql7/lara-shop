getYzm();

//-----------------------绑定验证码 请求------------------------

// 绑定邮箱
function bingEmail(th) {
    $.ajax({
        url: getApi('web/change_email'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            email_code: $('#em_code').val(),
            email: $('#new_email').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            $(th).attr('disabled', false);
            _msg({msg: res.msg});
            if (res.code === 0) {
                setTimeout(function(){
                    location.href ='account-safe.html';
                },3000);
            }
        },
        error: function (err) {
            _msg({msg: '请重试'});
            $(th).attr('disabled', false);
        }
    })
}

// 发送邮箱验证码
function getEmailCode(th) {
    $.ajax({
        url: getApi('coms/email_code'),
        type: 'post',
        data: {
            email: $('#new_email').val(),
            img_code: $('#code').val()
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                _msg({msg: res.msg})
                // 别的操作
              // 再次发送定时器
              var timer, num = 300;
              $(th).html(num + 's后重新发送');
              timer = setInterval(function () {
                num--;
                $(th).html(num + 's后重新发送');
                if (num <= 0) {
                  clearInterval(timer);
                  $(th).attr('disabled', false);
                  $(th).html('发送验证码邮件');
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

// 发送邮箱验证码验证
function sendEmailCode(th) {
    if (vE()) {
        // 禁用按钮
        $(th).attr('disabled', true);
        // 请求发送
        getEmailCode(th);
    } else {
        getYzm();
    }
}

// 邮箱验证
function vE(form) {
    var em = $('#new_email');
    var cd = $('#code');
    var vali = false;
    var reg_em = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(em.val());
    var reg_cd = /^[\d]{5}$/.test(cd.val());
    if (reg_em) {
        if (reg_cd) {
            vali = true;
        } else {
            vali = false;
            _msg({msg: '请5位数字验证码'})
        }
    } else {
        vali = false;
        _msg({msg: '请输入正确邮箱号'})
    }
    return vali;
}

// 验证
function vada(th) {
    $('#email_form').validate({
        rules: {
            new_email: {
                required: true,
                email: true
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
            bingEmail(th)
        }
    })
}