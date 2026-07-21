/* ============================================
   clock.js — 时钟模块
   深色组件，显示实时时间（17:00 格式）+ 日期
   ============================================ */

var Clock = (function() {
  'use strict';

  var U = AppUtils;
  var timer = null;
  var $time;
  var $date;

  function init() {
    $time = document.getElementById('clockTime');
    $date = document.getElementById('clockDate');

    update();
    timer = setInterval(update, 1000);
  }

  function update() {
    var now = new Date();
    var h = U.pad(now.getHours());
    var m = U.pad(now.getMinutes());

    if ($time) {
      $time.textContent = h + ':' + m;
    }

    if ($date) {
      var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      var dateStr = now.getFullYear() + '年'
        + (now.getMonth() + 1) + '月'
        + now.getDate() + '日'
        + ' 星期' + weekdays[now.getDay()];
      $date.textContent = dateStr;
    }
  }

  function destroy() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  return { init: init, destroy: destroy, update: update };

})();
