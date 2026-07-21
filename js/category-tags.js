/* ============================================
   category-tags.js — 分类标签模块
   目前仅展示图标，点击功能预留接口
   ============================================ */

var CategoryTags = (function() {
  'use strict';

  function init() {
    var $container = document.getElementById('categoryTags');
    if (!$container) { return; }

    /* 动态生成标签 */
    var categories = AppConfig.CATEGORIES;
    var html = '';
    for (var i = 0; i < categories.length; i++) {
      var c = categories[i];
      html += '<div class="category-tag" data-category="' + c.id + '" title="' + c.label + '">'
        + '<span class="icon-placeholder category-tag__icon"></span>'
        + '</div>';
    }
    $container.innerHTML = html;

    /* 点击事件 */
    $container.addEventListener('click', function(e) {
      var tag = e.target.closest('.category-tag');
      if (!tag) { return; }
      var category = tag.getAttribute('data-category');
      /* 接口：根据分类筛选内容 / 跳转分类页 */
      console.log('[分类标签] 点击:', category);
    });
  }

  return { init: init };

})();
