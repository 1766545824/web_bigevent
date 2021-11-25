$(function () {
  var layer = layui.layer;
  var form = layui.form;
  var laypage = layui.laypage;

  // 定义美化时间的过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date);
    var y = dt.getFullYear();
    var m = padZero(dt.getMonth() + 1);
    var d = padZero(dt.getDate());

    var hh = padZero(dt.getHours());
    var mm = padZero(dt.getMinutes());
    var ss = padZero(dt.getSeconds());

    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
  };

  // 定义补零的函数
  function padZero(n) {
    // 判断是否大于9 如果大于9 就不需要操作 如果不大于就在前面加个0 然后输出
    return n > 9 ? n : '0' + n
  }

  // 定义一个查询参数对象 将来请求数据的时候
  // 需要将请求参数对象 提交到服务器
  var q = {
    pagenum: 1, // 页码值 默认请求第一页的数据
    pagesize: 2, // 每页显示几条数据 默认每页两条
    cate_id: '', // 文章的分类 Id
    state: '' // 文章的发布状态
  };

  // 调用获取文章列表数据的方法
  initTable();
  // 调用文章分类的方法
  initCate();

  // 获取文章列表数据的方法
  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取文章列表失败！')
        }
        // 使用模板引擎来渲染页面的数据
        layer.msg('获取文章列表成功！');
        var htmlStr = template('tpl-table', res);
        $('tbody').html(htmlStr);
        // 调用渲染分页的方法  totar 数据总数
        renderPage(res.totar);
      }
    })
  }

  // 初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败！')
        }
        // layer.msg('获取分类数据成功！')

        // 调用模板引擎渲染分类的可选项
        var htmlStr = template('tpl-cate', res);
        // 属性选择器
        $('[name=cate_id]').html(htmlStr);
        // 通知 layui 重新渲染表单区域的 UI结构
        form.render();
      }
    })
  }

  // 为筛选表单 绑定 submit 事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault();
    // 获取表单中选中项的值
    var cate_id = $('[name=cate_id]').val();
    var state = $('[name=state]').val();
    // 为查询参数对象 q 中对应的属性赋值
    q.cate_id = cate_id;
    q.state = state;
    // 根据最新的筛选条件，重新渲染表格数据
    initTable();
  });

  // 定义渲染分页的方法
  function renderPage(totar) {
    // 调用 laypage.render() 方法来渲染分页的结构
    laypage.render({
      elem: 'pageBox', // 分页容器的id
      count: totar, // 总数据条数
      limit: q.pagesize, // 每页显示几条数据
      curr: q.pagenum,// 指定默认选中哪页
      layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
      limits: [2, 3, 5, 10],

      // 分页发生切换的时候 触发 jump 回调
      // 1.点击页码的时候，会触发 jump 回调
      // 2.只要调用了 laypage.render 方法，就会触发 jump 回调
      jump: function (obj, first) {
        // 可以通过 first 的值，来判断是通过哪种方式，触发的 jump回调
        // 如果 first 的值为true，证明是方式2 触发的
        // 否则就是方式1 触发的
        console.log(first);
        // 把最新的页码值 赋值到 q 这个查询参数对象中
        q.pagenum = obj.curr;
        // obj.curr 获得当前最新的页码值
        q.pagesize = obj.limit;
        // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
        // 根据最新的 q 获取对应的数据列表并渲染表格

        // 判断是通过哪种方式调用的 jump 如果是第一种方式 则可以触发函数 避免死循环
        if (!first) {
          initTable();
        }
      }
    })
  }

  // 通过代理的形式 为删除按钮绑定点击事件处理函数
  $('tbody').on('click', 'btn-delete', function () {
    // 获取删除按钮的个数
    var len = $('.btn-delete').length;
    // 获取文章的 id
    var id = $(this).attr('data-id');
    // 询问用户是否要删除数据
    layer.confirm('确认删除？', {icon: 3, title: '提示'}, function (index) {
      $.ajax({
        method: 'GET',
        url: 'my/article/delete/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除文章失败！')
          }
          layer.msg('删除文章成功！');
          // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
          // 如果没有剩余的数据了，则让页码值 -1 之后
          // 再重新调用 initTable 方法
          if (len === 1) {
            // 如果 len 的值为 1，那证明删除完毕后 页面上就没有任何数据了
            // 页码值最小 必须是 1
            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
            // 判断当前页码值是否为1 如果是1 就不变 如果不是就 减1页码值
          }
          initTable();
        }
      });
      layer.close(index)
    })
  })
});