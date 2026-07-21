/* ============================================
   main.js — 应用入口，初始化所有模块
   ============================================ */

(function() {
  'use strict';

  /**
   * 模块初始化顺序：
   * 1. 主题切换
   * 2. 独立组件（时钟、日历、天气、公告、博客、分类标签）
   * 3. 留言板（初始化预置数据）
   * 4. 弹幕（绑定留言板数据源）
   * 5. 音乐播放器
   */

  function bootstrap() {
    /* 1. 深色模式 */
    Theme.init();

    /* 2. 独立组件 */
    Clock.init();
    Calendar.init();
    Weather.init();
    Announcement.init();
    BlogList.init();
    CategoryTags.init();

    /* 3. 留言板（初始化预置数据） */
    Guestbook.init();

    /* 4. 弹幕 → 绑定留言板数据源 */
    Danmaku.setMessageSource(function() {
      return Guestbook.getMessages();
    });
    Danmaku.init();

    /* 留言板数据变更 → 刷新弹幕 */
    Guestbook.onChange(function() {
      Danmaku.refresh();
    });

    /* 5. 音乐播放器 */
    MusicPlayer.init();

    /* 品牌名替换 */
    var logoEl = document.querySelector('.top-nav__logo');
    if (logoEl) {
      /* 保留图标占位，只替换文字 */
      var textNode = logoEl.lastChild;
      if (textNode && textNode.nodeType === 3) {
        textNode.textContent = ' ' + AppConfig.BRAND.name;
      } else {
        logoEl.appendChild(document.createTextNode(' ' + AppConfig.BRAND.name));
      }
    }

    /* 页脚 ICP */
    var icpLink = document.querySelector('.page-footer__icp a');
    if (icpLink) {
      icpLink.textContent = AppConfig.BRAND.icp;
      icpLink.href = AppConfig.BRAND.icpUrl;
    }

    /* 页面标题 */
    document.title = AppConfig.BRAND.name;

    /* Hero 图片区域 */
    var heroImg = document.getElementById('heroImage');
    var heroImgPlaceholder = document.querySelector('.hero-image-area__placeholder-text');
    if (heroImg && AppConfig.HERO_IMAGE.src) {
      heroImg.src = AppConfig.HERO_IMAGE.src;
      heroImg.alt = AppConfig.HERO_IMAGE.alt;
      heroImg.style.display = 'block';
      if (heroImgPlaceholder) { heroImgPlaceholder.style.display = 'none'; }
    }

    console.log('🏠 ' + AppConfig.BRAND.name + ' 首页已就绪');
    console.log('🎨 深色模式: ' + (localStorage.getItem('deshie-theme') || 'light'));
    console.log('🔌 所有 API 接口已预留，见各 JS 文件注释');
  }

  /* DOM 就绪后启动 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
