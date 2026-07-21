/* ============================================
   announcement.js — 公告栏模块
   仅管理员可编辑，访问者只读
   ============================================ */

var Announcement = (function() {
  'use strict';

  var $text;
  var $hint;

  function init() {
    $text = document.getElementById('announcementText');
    $hint = document.querySelector('.announcement-card__admin-hint');

    if ($text) {
      $text.innerHTML = AppConfig.ANNOUNCEMENT;
    }

    /* 接口：从后端获取公告
       fetch('/api/announcement')
         .then(function(res) { return res.json(); })
         .then(function(data) {
           if ($text) { $text.innerHTML = data.content; }
         });
    */

    /* 接口：管理员验证 & 编辑
       - 验证管理员身份后显示编辑按钮
       - 点击编辑 → 弹出编辑器或切换为可编辑状态
       - 保存 → PUT 到后端
    */
  }

  return { init: init };

})();
