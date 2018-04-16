var reviews = []; // 评价信息

getOrderEva();

//------------------------评价页面 请求-------------------------

// 请求评价订单
function getOrderEva() {
    $.ajax({
        url: getApi('web/review_page'),
        type: 'post',
        data: {
            user_id: getobjS('user').id,
            token: getobjS('user').token,
            order_id: getSearch().oid
        },
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                //头部订单信息
                $('#or_no').text(res.info.order_no);
                $('#or_tm').text(res.info.create_time);
                // 订单评价
                $('#_ev_bot').html(orderEvaHtml(res.info.goods));
                // 挂载实例
                mountData(res.info.goods);
            } else {
                _msg({msg: res.msg})
            }
        }
    })
}

// 提交评价
function submitEva() {
    var data = dafa({
        user_id: getobjS('user').id,
        token: getobjS('user').token,
        order_id: getSearch().oid,
        reviews: reviews
    });
    $.ajax({
        url: getApi('web/review_act'),
        type: 'post',
        data: data,
        dataType: 'jsonp',
        success: function (res) {
            loginOverdue(res.code);
            if (res.code === 0) {
                _msg({msg: res.msg});
                location.href = 'my-evaluate.html'
            } else {
                _msg({msg: res.msg});
            }
        },
        error: function (err) {
            console.log(err);
            _msg({msg: '请重试'});
        }
    })
}

//------------------------评价页面 功能-------------------------

// 订单评价页面html
function orderEvaHtml(data) {
    var html = '';
    for (var i = 0, len = data.length; i < len; i++) {
        html += '<div><div class="_l"><a href="goods.html?id=' + data[i].id + '">' +
            '<img src="' + data[i].good_img + '" alt="good">' +
            '<h3>' + data[i].good_name + '</h3></a>' +
            '<p><em>￥' + data[i].real_price + '</em></p>' +
            '<p>' + data[i].spec_str + '</p></div>' +
            '<div class="_r"><ul><li><label>满意度</label>' +
            '<div id="star' + data[i].product_id + '" data-score="5"></div></li>' +
            '<li><label>评价</label>' +
            '<div><textarea id="eva' + data[i].product_id + '" onblur="textData(' + data[i].product_id + ',' + i + ')"></textarea></div>' +
            '<div class="img_box" id="img_box' + data[i].product_id + '">' +
            '<button type="button" class="layui-btn" id="test' + data[i].product_id + '">' +
            '<i class="iconfont icon-shangchuantupian upImg"></i></button></div></li></ul></div></div>';
    }
    return html
}

// 评分插件激活
function openStar(e, ind) {
    $(e).raty({
        path: "../star/img",
        hints: ['差劲', '失望', '一般', '喜欢', '极好'],
        score: function () {
            return $(this).attr('data-score');
        },
        click: function (score, evt) {
            reviews[ind].point = score;
        }
    });
}

// 图片上传
function updateImg(bind_e, box_e, ind) {
    var p = new MyPromise(qiniuSetUp);
    p.then(function (data) {
        layui.use('upload', function () {
            var upload = layui.upload;
            //执行实例
            var uploadInst = upload.render({
                elem: bind_e //绑定元素
                , url: data.http//上传接口
                , data: data.data
                , multiple: true
                , before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                    layer.load(); //上传loading
                    //将每次选择的文件追加到文件队列
                    var files = obj.pushFile();
                    //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                    obj.preview(function (index, file, result) {
                        // console.log(index); //得到文件索引
                        // console.log(file); //得到文件对象
                        // console.log(result); //得到文件base64编码，比如图片
                        //这里还可以做一些 append 文件列表 DOM 的操作
                        //obj.upload(index, file); //对上传失败的单个文件重新上传，一般在某个事件中使用
                        // delete files[index]; //删除列表中对应的文件，一般在某个事件中使用
                        $(box_e).append('<img src="' + result + '">');
                    });
                }, done: function (res, index, upload) {
                    layer.closeAll('loading'); //关闭loading
                    if (res.key) {
                        if ($.inArray(res.key, reviews[ind].imgs) === -1) {
                            reviews[ind].imgs.push(res.key);
                        }
                    } else {
                        layer.msg(res.msg || '上传失败，请刷新重试')
                    }
                }, error: function (index, upload) {
                    $(box_e).children('img').eq(index).remove();
                    layer.closeAll('loading'); //关闭loading
                    layer.msg('请重试')
                }
            });
        });
    })
}

// 文本框数据挂载
function textData(e, i) {
    reviews[i].content = $('#eva' + e + '').val();
}

// 挂载插件和数据
function mountData(data) {
    for (var i = 0, len = data.length; i < len; i++) {
        // 激活评分插件
        openStar('#star' + data[i].product_id + '', i);
        // 激活图片上传插件
        updateImg('#test' + data[i].product_id + '', '#img_box' + data[i].product_id + '', i);
        var obj = {
            good_id: data[i].good_id,
            product_id: data[i].product_id,
            point: '5',
            content: '',
            imgs: []
        };
        reviews.push(obj)
    }
}

