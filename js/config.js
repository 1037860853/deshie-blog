/* ============================================
   config.js — 数据配置
   接口：所有数据均可替换为后端 API 请求
   ============================================ */

var AppConfig = (function() {
  'use strict';

  /* ---- 品牌信息 ---- */
  var BRAND = {
    name: '秋枫的学习笔记',
    shortName: '秋枫笔记',
    icp: '赣ICP备2026016208号-1',
    icpUrl: 'https://beian.miit.gov.cn/',
  };

  /* ---- 导航链接 ---- */
  var NAV_LINKS = [
    { label: '首页',   href: '#',   active: true },
    { label: '归档',   href: '#',   active: false },
    { label: '关于',   href: '#',   active: false },
    { label: '友链',   href: '#',   active: false },
    { label: '博客',   href: '/blog', target: '_blank', active: false },
  ];

  /* ---- 音乐库存 —— 接口：替换 src 为真实音频 URL ---- */
  var PLAYLIST = [
    { id: 1, name: '晴天',     artist: '周杰伦', duration: 269, src: '' },
    { id: 2, name: '夜曲',     artist: '周杰伦', duration: 231, src: '' },
    { id: 3, name: '七里香',   artist: '周杰伦', duration: 299, src: '' },
    { id: 4, name: '稻香',     artist: '周杰伦', duration: 223, src: '' },
    { id: 5, name: '起风了',   artist: '买辣椒也用券', duration: 313, src: '' },
  ];

  /* ---- 歌词数据 —— 接口：替换为歌词解析结果 ---- */
  var LYRICS = [
    { time: 0,   text: '暂无歌词数据' },
    { time: 999, text: '请添加 .lrc 歌词文件 ♪' },
  ];

  /* ---- 预置留言（访客留言板）---- */
  var PRESET_MESSAGES = [
    { author: '小明', text: '博客做得真不错！期待更多内容~', device: 'Windows / Chrome' },
    { author: '小红', text: '打卡！坚持写作加油 💪', device: 'macOS / Safari' },
    { author: '秋风', text: '音乐播放器好赞 🎵', device: 'Android / WeChat' },
  ];

  /* ---- 公告栏内容 —— 接口：替换为后端 API ---- */
  var ANNOUNCEMENT = '欢迎来到 秋枫的学习笔记！🎉<br>这里记录了我的学习笔记、生活随笔和项目分享。公告内容由后台编辑，访客无法修改。';

  /* ---- 博客文章列表 —— 接口：替换为 WordPress REST API ---- */
  var BLOG_POSTS = [
    { title: '博客文章示例 1', date: '2026-07-20', url: '/blog' },
    { title: '博客文章示例 2', date: '2026-07-18', url: '/blog' },
    { title: '博客文章示例 3', date: '2026-07-15', url: '/blog' },
  ];

  /* ---- 分类标签 ---- */
  var CATEGORIES = [
    { id: 'tech',     label: '技术',   icon: '' },
    { id: 'life',     label: '生活',   icon: '' },
    { id: 'notes',    label: '笔记',   icon: '' },
    { id: 'gallery',  label: '相册',   icon: '' },
    { id: 'projects', label: '项目',   icon: '' },
  ];

  /* ---- 天气 API (UAPI) ---- */
  var WEATHER_CITY = '南昌';
  var UAPI = {
    /* 生产环境通过 Nginx 代理 /api/weather → uapis.cn */
    baseUrl: '/api/weather',
    /* 本地开发直连（需替换为你的 key，仅开发时用）:
       baseUrl: 'https://uapis.cn/api/v1/misc/weather',
       apiKey: 'uapi-你的密钥',
    */
    apiKey: '',
  };

  /* ---- 英雄区左侧图片 ---- */
  var HERO_IMAGE = {
    src: '',  /* 接口：替换为实际图片路径，如 'assets/images/hero-photo.jpg' */
    alt: '个人照片',
    placeholder: '照片区域\n(略小于日历)',
  };

  return {
    BRAND: BRAND,
    NAV_LINKS: NAV_LINKS,
    PLAYLIST: PLAYLIST,
    LYRICS: LYRICS,
    PRESET_MESSAGES: PRESET_MESSAGES,
    ANNOUNCEMENT: ANNOUNCEMENT,
    BLOG_POSTS: BLOG_POSTS,
    CATEGORIES: CATEGORIES,
    WEATHER_CITY: WEATHER_CITY,
    UAPI: UAPI,
    HERO_IMAGE: HERO_IMAGE,
  };

})();
