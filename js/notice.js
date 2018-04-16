getArticleDetail();

// 请求文章详情
function getArticleDetail() {
    $.ajax({
        url: getApi('web/article_detail'),
        type: 'post',
        data: {
            article_id: getSearch().id
        },
        dataType: 'jsonp',
        success: function (res) {
            if (res.code === 0) {
                // $('#_nt').html(utf8to16(base64decode(res.content)))
                $('#_nt').html(res.content)
            } else {
                _msg({msg: res.msg})
            }
        },
        error: function (err) {
            _msg({msg: '请重试'})
        }
    })
}