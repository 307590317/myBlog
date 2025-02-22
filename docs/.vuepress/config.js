module.exports = {
  // theme:"antdocs",
  title: "MrZhao's blog",
  description: "个人博客",
  base: "/",
  head: [
    ["link", { rel: "icon", href: "/assets/logo.jpg" }]
  ],
  markdown: {
    toc: {
      includeLevel: [2, 3, 4]
    },
    lineNumbers: false,
  },
  themeConfig: {
    nav: require("./config/nav"),
    sidebar: require("./config/sidebar"),
    lastUpdated: "上次更新",
    editLinks: false,
    algolia: {
      apiKey: '89b040d15418343620172b26763c0a5a',
      indexName: 'zhaoyu',
      startUrls: ['https://www.zhaoyu.fit/']
    }
  }
};