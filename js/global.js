// 请求api
function getApi(str) {
    // return 'http://api.lara-shop.cn/api/' + str   // 服务器
    // return 'http://192.168.31.231:8080/Laravel-Shop/trunk/public/api/' + str   // 刘
    // return 'http://192.168.31.236/api/' + str        // 李
    return 'http://192.168.31.182/Laravel-Shop/trunk/public/api/' + str        // 舵
    // return 'http://192.168.31.234/Laravel-Shop/trunk/public/api/' + str        // 潘
    // return 'http://192.168.31.234/Laravel-Shop/trunk/public/api/' + str        // 潘
}

// 请求参数格式
function dafa(data) {
    var dataStr = '';
    for (var i in data) {
        if (typeof data[i] === 'object') { // 若为对象转化为字符串
            data[i] = JSON.stringify(data[i])
        }
        dataStr += i + '=' + data[i] + '&'
    }
    dataStr = dataStr.replace(/(null)|(undefined)|(<)|(>)/gi, '""')
    return dataStr.substring(0, dataStr.length - 1)
}

// 本地缓存-存
function setobjS(key, val) {
    sessionStorage.setItem(key, JSON.stringify(val))
}

// 本地缓存-删
function delobjS(key) {
    sessionStorage.removeItem(key)
}

// 本地缓存-取
function getobjS(key) {
    return JSON.parse(sessionStorage.getItem(key))
}

// 获取地址栏信息
function getSearch() {
    var arr = location.search.slice(1).split('&'),
        arr3 = null, arr4 = null, arr5 = {};
    for (var i = 0; i < arr.length; i++) {
        arr3 = arr[i];
        arr4 = arr3.split('=');
        arr5[arr4[0]] = arr4[1];
    }
    return arr5;

    // es6语法
    /*    let result = {};
    let groups = location.search.slice(1).split('&');
    for (let item of groups) {
        let [key, value] = item.split('=');
        result[key] = value
    }
    return result;*/
}

// 非搜索页进入搜索清除缓存
function clearSearch() {
    delobjS('search')
}

var timer;

/**
 * 弹出提示
 * @param option
 * title string 标题
 * msg string 内容
 * time number 时间
 * skin string 皮肤 default默认居中透明  fade-in 右侧移入
 * @private
 */
function _msg(option) {
    option.title = option.title || '提示';
    option.msg = option.msg || '这是一条提示信息';
    option.time = option.time || 2000;
    option.skin = 'default'; // 'fade-in'
    var msg = $('._msg');
    // 多次msg出现情况处理
    if (msg.length > 0) {
        // 重复点击前次msg上移 效果需要优化
        /*for (var i = 0, len = msg.length; i < len; i++)
            msg.eq(i).animate({
                top: parseFloat(msg.eq(i).css('top')) - (parseFloat(msg.eq(i).css('height')))
            }, 200)*/
        // 重复点击前次msg移除
        msg.remove();
    }
    // 多次提示 移除定时器
    if (timer) {
        clearTimeout(timer)
    }
    var str = $('<div class="_msg ' + option.skin + '"><h3>' + option.title + '</h3><p>' + option.msg + '</p></div>');
    $('body').append(str);
    timer = setTimeout(function () {
        var msg = $('._msg');
        switch (option.skin) {
            case 'default':
                msg.remove();
                break;
            case 'fade-in':
                msg.animate({top: '150px', opacity: .2}, 600, function () {
                    msg.remove()
                });
        }

    }, option.time)
}

/*// 防抖超时调用函数

/!**
 * 防抖
 * @param fn 最终要执行的回调函数
 * @param item 回调函数所需参数option
 *!/
function antiShake(fn, item) {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(function () {
        fn && fn(item)
    }, 500)
}*/

// 退出登录
function logOut() {
    if ((getobjS('user'))) {
        $.ajax({
            url: getApi('web/logout'),
            type: 'post',
            data: {user_id: getobjS('user').id, type: 0},
            dataType: 'jsonp',
            success: function (res) {
                if (res.code === 0) {
                    _msg({msg: res.msg});
                    delobjS('user');
                    location.href = 'login.html';
                } else {
                    _msg({msg: res.msg});
                }
            },
            error: function (err) {
            }
        })
    }
}

// 未登录限制 - 跳转
function loginStatus(val) {
    if (getobjS('user')) {
        location.href = val
    } else {
        location.href = 'login.html'
    }
}

// 未登录限制 禁止访问
function noLogin() {
    if (!getobjS('user')) {
        location.href = 'login.html'
    }
}

// 登陆过期限制
function loginOverdue(code) {
    if (code === 2) {
        _msg({msg: '登录已过期！您已安全退出'});
        setTimeout(function () {
            location.href = 'login.html';
        }, 1000)
    }
    siteClose(code)
}

// 站点关闭
function siteClose(code) {
    if (code === 3) {
        _msg({msg: '站点正在维护升级！敬请期待'});
        setTimeout(function () {
            location.href = 'siteClose.html';
        }, 1000)
    }
}

// BASE64加密解密
var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

//编码的方法
function base64encode(str) {

    var out, i, len;

    var c1, c2, c3;

    len = str.length;

    i = 0;

    out = "";

    while (i < len) {

        c1 = str.charCodeAt(i++) & 0xff;

        if (i == len) {

            out += base64EncodeChars.charAt(c1 >> 2);

            out += base64EncodeChars.charAt((c1 & 0x3) << 4);

            out += "==";

            break;

        }

        c2 = str.charCodeAt(i++);

        if (i == len) {

            out += base64EncodeChars.charAt(c1 >> 2);

            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));

            out += base64EncodeChars.charAt((c2 & 0xF) << 2);

            out += "=";

            break;

        }

        c3 = str.charCodeAt(i++);

        out += base64EncodeChars.charAt(c1 >> 2);

        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));

        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));

        out += base64EncodeChars.charAt(c3 & 0x3F);

    }

    return out;

}

//解码的方法
function base64decode(str) {

    var c1, c2, c3, c4;

    var i, len, out;

    len = str.length;

    i = 0;

    out = "";

    while (i < len) {

        do {

            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];

        } while (i < len && c1 == -1);

        if (c1 == -1)

            break;

        do {

            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];

        } while (i < len && c2 == -1);

        if (c2 == -1)

            break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        do {

            c3 = str.charCodeAt(i++) & 0xff;

            if (c3 == 61)

                return out;

            c3 = base64DecodeChars[c3];

        } while (i < len && c3 == -1);

        if (c3 == -1)

            break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        do {

            c4 = str.charCodeAt(i++) & 0xff;

            if (c4 == 61)

                return out;

            c4 = base64DecodeChars[c4];

        } while (i < len && c4 == -1);

        if (c4 == -1)

            break;

        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);

    }

    return out;

}

//编码的方法
function utf16to8(str) {

    var out, i, len, c;

    out = "";

    len = str.length;

    for (i = 0; i < len; i++) {

        c = str.charCodeAt(i);

        if ((c >= 0x0001) && (c <= 0x007F)) {

            out += str.charAt(i);

        } else if (c > 0x07FF) {

            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));

            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));

            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));

        } else {

            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));

            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));

        }

    }

    return out;

}

//解码的方法
function utf8to16(str) {


    var out, i, len, c;


    var char2, char3;


    out = "";


    len = str.length;


    i = 0;

    while (i < len) {


        c = str.charCodeAt(i++);


        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;

        }

    }
    return out;
}

// 结束时间
function getDate(tm) {
    var tt = new Date(parseInt(tm) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ")
    return tt;
}

// 倒计时
/*var timeMsg = "";
 var NowTime = new Date();
 function TimeClose(overTime, event, msg) {

 overTime = overTime * 1000 - NowTime.getTime();
 try {
 var dayRound = Math.floor(overTime / 1000 / 60 / 60 / 24);
 var hourRound = Math.floor(overTime / 1000 / 60 / 60 % 24);
 var minutesRound = Math.floor(overTime / 1000 / 60 % 60);
 var secondRound = Math.floor(overTime / 1000 % 60);
 if (dayRound < 10) {
 dayRound = "0" + dayRound;
 }
 if (hourRound < 10) {
 hourRound = "0" + hourRound;
 }
 if (minutesRound < 10) {
 minutesRound = "0" + minutesRound;
 }
 if (secondRound < 10) {
 secondRound = "0" + secondRound;
 }
 if (overTime > 0) {
 timeMsg = "<span class=\"timer\"><em>" + dayRound + "</em><strong>天</strong></span><span class=\"timer\"><em>" + hourRound + "</em><strong>时</strong></span><span class=\"timer\"><em>" + minutesRound + "</em><strong>分</strong></span><span class=\"timer\"><em>" + secondRound + "</em><strong>秒</strong></span>";
 $(event).html(timeMsg);
 } else {
 //不展示倒计时控件
 $(event).text('活动已结束');
 }
 /!* var showTimeMsg = msg.replace("{CountDown}", timeMsg);
 if ($("#isVotedFlag").val() == "0") {
 $("#ShowTime").html(showTimeMsg);
 }*!/
 overTime = overTime - 1 * 1000;
 if (overTime >= 0) {
 window.setTimeout('TimeClose("' + overTime + '","' + msg + '")',
 1000);
 }
 } catch (e) {
 // event.hide();
 } finally {
 //
 }
 }*/

/*
 startclock();
 var timerID = null;
 var timerRunning = false;

 function showtime() {
 var Today = new Date();
 var NowHour = Today.getHours();
 var NowMinute = Today.getMinutes();
 var NowMonth = Today.getMonth();
 var NowDate = Today.getDate();
 var NowYear = Today.getYear();
 var NowSecond = Today.getSeconds();
 if (NowYear < 2000)
 NowYear = 1900 + NowYear;
 Today = null;
 var Hourleft = 23 - NowHour;
 var Minuteleft = 59 - NowMinute;
 var Secondleft = 59 - NowSecond;
 var Yearleft = 2009 - NowYear;
 var Monthleft = 12 - NowMonth - 1;
 var Dateleft = 31 - NowDate;
 if (Secondleft < 0) {
 Secondleft = 60 + Secondleft;
 Minuteleft = Minuteleft - 1;
 }
 if (Minuteleft < 0) {
 Minuteleft = 60 + Minuteleft;
 Hourleft = Hourleft - 1;
 }
 if (Hourleft < 0) {
 Hourleft = 24 + Hourleft;
 Dateleft = Dateleft - 1;
 }
 if (Dateleft < 0) {
 Dateleft = 31 + Dateleft;
 Monthleft = Monthleft - 1;
 }
 if (Monthleft < 0) {
 Monthleft = 12 + Monthleft;
 Yearleft = Yearleft - 1;
 }
 var Temp = Yearleft + '年, ' + Monthleft + '月, ' + Dateleft + '天, ' + Hourleft + '小时, ' + Minuteleft + '分, ' + Secondleft + '秒'
 timerID = setTimeout("showtime()", 1000);
 timerRunning = true;
 console.log(Temp);
 }

 var timerID = null;
 var timerRunning = false;

 function stopclock() {
 if (timerRunning)
 clearTimeout(timerID);
 timerRunning = false;
 }

 function startclock() {
 stopclock();
 showtime();
 }
 */
var timeMsg = '';

function getRTime(time, e) {
    var EndTime = time * 1000;
    var NowTime = new Date();
    var t = EndTime - NowTime.getTime();
    var d = Math.floor(t / 1000 / 60 / 60 / 24);
    var h = Math.floor(t / 1000 / 60 / 60 % 24);
    var m = Math.floor(t / 1000 / 60 % 60);
    var s = Math.floor(t / 1000 % 60);
    if (d < 10) {
        d = "0" + d;
    }
    if (h < 10) {
        h = "0" + h;
    }
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }
    if (t > 0) {
        timeMsg = "<span><em>" + d + "</em><strong>天</strong></span><span><em>" + h + "</em><strong>时</strong></span><span><em>" + m + "</em><strong>分</strong></span><span><em>" + s + "</em><strong>秒</strong></span>";
    } else {
        timeMsg = '活动已结束';
    }
    if (t >= 0) {
        window.setTimeout('getRTime("' + time + '","' + e + '")',
            1000);
    }
    $(e).html(timeMsg)
}

/**
 *  获取商城系统配置 存入配置对象
 *  $type 配置类型
 */
function getSystemConfig($type) {
    // if (!getobjS($type)) {
    $.ajax({
        url: getApi('web/config_info'),
        type: 'post',
        data: {title: $type},
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                setobjS($type, res.info);
            } else {
                _msg({msg: res.msg});
            }
        },
        error: function (err) {
            _msg({msg: '对不起，请稍后重试'});
        }
    })
    // }
}

// 获取logo
function systemLogo(e, user) {
    e = e || '.site-logo';
    if (getobjS('website')) {
        var logoImg = '<a href="index.html"><img src="' + getobjS('website').logo + '" alt="LOGO"></a>';
        var logoName = '<a href="index.html"><span>' + getobjS('website').name + '</span></a>';
        user ? $(e).html(logoName) : $(e).html(logoImg);
        $('.shop-home').html(logoName + '欢迎你');
    }
}

// es5 promise
function MyPromise(fn) {
    this.value;
    this.status = 'pending';
    this.resolveFunc = function () {
    };
    this.rejectFunc = function () {
    };
    fn(this.resolve.bind(this), this.reject.bind(this));
}

MyPromise.prototype.resolve = function (val) {
    var self = this;
    if (this.status == 'pending') {
        this.status = 'resolved';
        this.value = val;
        setTimeout(function () {
            self.resolveFunc(self.value);
        }, 0);
    }
};

MyPromise.prototype.reject = function (val) {
    var self = this;
    if (this.status == 'pending') {
        this.status = 'rejected';
        this.value = val;
        setTimeout(function () {
            self.rejectFunc(self.value);
        }, 0);
    }
};

MyPromise.prototype.then = function (resolveFunc, rejectFunc) {
    this.resolveFunc = resolveFunc;
    this.rejectFunc = rejectFunc;
};

// 七牛开关
if (!getobjS('switch')) {
    getSystemConfig('switch');
}

// 获取七牛token
function getQiNiu(fn) {
    var user = getobjS('user') || {};
    $.ajax({
        url: getApi('coms/qiniu_token'),
        type: 'post',
        data: {
            port: 1, // 0 平台1 pc
            id: user.id,
            name: user.name
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                var qiniu = {
                    js_token: res.token,
                    dead_time: res.dead_time,
                    domain: res.domain,
                    region: res.region
                };
                setobjS('qiniu', qiniu);
                fn && fn()
            } else {
                _msg({msg: res.msg});
            }
        },
        error: function (err) {
            console.log(err);
            _msg({msg: '网络连接失败'});
        }
    });
}

// 七牛存储设置
function qiniuSetUp(resolve, reject, tp) {
    tp = tp || 7;
    var data = {};
    // 处理七牛权限
    var canshu = getobjS('switch');
    // 本地是否有存储数据
    if (getobjS('qiniu')) {
        var qiniu = getobjS('qiniu');
        // 初始化七牛上传
        var new_time = Date.parse(new Date()) / 1000;
        // 本地数据是否失效
        if (new_time >= parseInt(qiniu.dead_time)) {
            // 失效重新请求
            getQiNiu(function () {
                qiniu = getobjS('qiniu');
                if (canshu.qiniu == 1) {
                    switch (qiniu.region) {
                        case 'z0': // 华东区
                            data.http = 'http://upload.qiniup.com';
                            break;
                        case 'z1': // 华北区
                            data.http = 'http://upload-z1.qiniup.com';
                            break;
                        case 'z2': // 华南区
                            data.http = 'http://upload-z2.qiniup.com';
                            break;
                        case 'na0': // 北美
                            data.http = 'http://upload-na0.qiniup.com';
                            break;
                        default:
                            data.http = 'http://upload.qiniup.com';
                    }
                    data.data = {token: qiniu.js_token}
                } else {
                    data.http = getApi('coms/upload-img');
                    data.data = {type: tp}
                }
                resolve(data)
            });
        } else {
            // 未失效使用本地数据
            if (canshu.qiniu == 1) {
                switch (qiniu.region) {
                    case 'z0': // 华东区
                        data.http = 'http://upload.qiniup.com';
                        break;
                    case 'z1': // 华北区
                        data.http = 'http://upload-z1.qiniup.com';
                        break;
                    case 'z2': // 华南区
                        data.http = 'http://upload-z2.qiniup.com';
                        break;
                    case 'na0': // 北美
                        data.http = 'http://upload-na0.qiniup.com';
                        break;
                    default:
                        data.http = 'http://upload.qiniup.com';
                }
                data.data = {token: qiniu.js_token}
            } else {
                data.http = getApi('coms/upload-img');
                data.data = {type: tp}
            }
            resolve(data)
        }
    } else {
        // 本地无数据 发起请求
        getQiNiu(function () {
            if (canshu.qiniu == 1) {
                var qiniu = getobjS('qiniu');
                switch (qiniu.region) {
                    case 'z0': // 华东区
                        data.http = 'http://upload.qiniup.com';
                        break;
                    case 'z1': // 华北区
                        data.http = 'http://upload-z1.qiniup.com';
                        break;
                    case 'z2': // 华南区
                        data.http = 'http://upload-z2.qiniup.com';
                        break;
                    case 'na0': // 北美
                        data.http = 'http://upload-na0.qiniup.com';
                        break;
                    default:
                        data.http = 'http://upload.qiniup.com';
                }
                data.data = {token: qiniu.js_token}
            } else {
                data.http = getApi('coms/upload-img');
                data.data = {type: tp}
            }
            resolve(data)
        });
    }
    // return data
}

// 封装防抖+loading状态obj
var antiShakeObj = {
    lock: false, // 是否锁定进程
    loading: function () {
        var load = '<div id="loading" class="loading-box"><img src="../imgs/Spinner.gif" alt="loading"></div>';
        $('body').append(load);
    },
    antiShake: function (fn) {
        // 检查是否锁定进程
        if (this.lock) {
            _msg({msg: '为避免造成您的损失，请勿重复提交'});
            return
        }
        // 重置状态码
        this.ok = 99;
        // 防抖 - 上锁锁定进程方式
        this.lock = true;
        // 赋值this指针
        var self = this;
        // 插入loading元素
        this.loading();
        // 防抖 - 超时调用处理方式
        /*if (this.timer) {
            clearTimeout(this.timer);
            self.ok = 2;
            self.callBack();
        }
        this.timer = setTimeout(function () {
            // fn && fn(item);

        }, 500);*/
        // 差网络环境处理
        setTimeout(function () {
            if (self.ok !== 0 && self.ok !== 1) {
                self.ok = 3;
                self.callBack();
            }
        }, 2500);
        // 异步状态回调
        var p = new MyPromise(fn);
        p.then(function (res) {
            self.ok = 0;
            self.callBack(res);
        }, function (err) {
            self.ok = 1;
            self.callBack(err);
        })
    },
    ok: 99, // 状态码 0成功 1失败 2防抖 3网络超时（2.5秒）
    callBack: function (res) {
        // 判断状态码
        switch (this.ok) {
            case 0:
                _msg({msg: res.msg});
                break;
            case 1:
                _msg({msg: '请求失败' + res});
                break;
            case 2:
                _msg({msg: '为避免造成您的损失，请勿重复提交'});
                break;
            case 3:
                _msg({msg: '网络环境较差，请耐心等候或重试'});
                break;
        }
        // 移除loading元素
        $('#loading').remove();
        // 延迟1秒解开防抖锁定
        var self = this;
        setTimeout(function () {
            self.lock = false;
        }, 1000);
    },
    timer: ''
};