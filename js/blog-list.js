/* ============================================
   blog-list.js — 博客卡片模块
   点击跳转至对应博客文章（/blog 目录）
   ============================================ */

var BlogList = (function() {
  'use strict';

  var U = AppUtils;

  function init() {
    render();
  }

  function render() {
    var $list = document.getElementById('blogList');
    if (!$list) { return; }

    var posts = AppConfig.BLOG_POSTS;

    /* 接口：从 WordPress REST API 获取真实博客列表
       fetch('/blog/wp-json/wp/v2/posts?per_page=3')
         .then(function(res) { return res.json(); })
         .then(function(data) {
           posts = data.map(function(p) {
             return {
               title: p.title.rendered,
               date: new Date(p.date).toISOString().split('T')[0],
               url: p.link,
             };
           });
           renderWith(posts);
         });
    */

    renderWith(posts);
  }

  function renderWith(posts) {
    var $list = document.getElementById('blogList');
    if (!$list) { return; }

    var html = '';
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      html += '<li>'
        + '<a class="blog-card__item" href="' + U.escapeHtml(p.url) + '"'
        + (p.url.startsWith('http') || p.url.startsWith('/blog') ? ' target="_blank"' : '')
        + '>'
        + '<span class="blog-card__item-title">' + U.escapeHtml(p.title) + '</span>'
        + '<span class="blog-card__item-date">' + U.escapeHtml(p.date) + '</span>'
        + '<span class="icon-placeholder blog-card__item-arrow"></span>'
        + '</a>'
        + '</li>';
    }

    $list.innerHTML = html;
  }

  return { init: init, render: render };

})();
