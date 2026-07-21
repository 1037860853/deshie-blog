/* ============================================
   calendar.js — 日历组件（薄荷绿卡片）
   ============================================ */

var Calendar = (function() {
  'use strict';

  var calYear;
  var calMonth; /* 0-based */

  var $grid;
  var $label;
  var $btnPrev;
  var $btnNext;

  function init() {
    $grid    = document.getElementById('calendarGrid');
    $label   = document.getElementById('calendarMonthLabel');
    $btnPrev = document.getElementById('calPrev');
    $btnNext = document.getElementById('calNext');

    var now = new Date();
    calYear  = now.getFullYear();
    calMonth = now.getMonth();

    $btnPrev.addEventListener('click', function() {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      render();
    });

    $btnNext.addEventListener('click', function() {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      render();
    });

    /* 日期点击 */
    $grid.addEventListener('click', function(e) {
      var dayEl = e.target.closest('.calendar-widget__day');
      if (!dayEl) { return; }
      /* 接口：点击日期后的行为（如跳转日记、显示日程等）*/
      var day = dayEl.textContent.trim();
      if (day && !dayEl.classList.contains('calendar-widget__day--other-month')) {
        console.log('[日历] 点击日期:', calYear + '-' + (calMonth + 1) + '-' + day);
      }
    });

    render();
  }

  function render() {
    if (!$grid || !$label) { return; }

    $label.textContent = (calMonth + 1) + '月 ' + calYear;

    var headers = ['日', '一', '二', '三', '四', '五', '六'];
    var html = '';
    for (var i = 0; i < 7; i++) {
      html += '<div class="calendar-widget__day-header">' + headers[i] + '</div>';
    }

    var firstDay = new Date(calYear, calMonth, 1).getDay();
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    var daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    var today = new Date();
    var todayDate = today.getDate();
    var todayMonth = today.getMonth();
    var todayYear = today.getFullYear();

    /* 上月填充 */
    for (var p = firstDay - 1; p >= 0; p--) {
      html += '<div class="calendar-widget__day calendar-widget__day--other-month">'
        + (daysInPrevMonth - p) + '</div>';
    }

    /* 本月 */
    for (var d = 1; d <= daysInMonth; d++) {
      var cls = 'calendar-widget__day';
      if (d === todayDate && calMonth === todayMonth && calYear === todayYear) {
        cls += ' calendar-widget__day--today';
      }
      html += '<div class="' + cls + '">' + d + '</div>';
    }

    /* 下月填充，凑满 6 行 */
    var totalCells = firstDay + daysInMonth;
    var remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (var n = 1; n <= remaining; n++) {
      html += '<div class="calendar-widget__day calendar-widget__day--other-month">'
        + n + '</div>';
    }

    $grid.innerHTML = html;
  }

  return { init: init, render: render };

})();
