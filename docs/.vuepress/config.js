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
      // apiKey: '89b040d15418343620172b26763c0a5a',
      apiKey: '4fa1417a551662a4fda9c5575dd0bef7',
      indexName: 'zhaoyu',
      startUrls: ["https://zhaoyu.fit/", "https://www.zhaoyu.fit/"],
    }
  }
};