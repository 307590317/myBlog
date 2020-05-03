module.exports = {
  // theme:"antdocs",
  title: "MrZhao's blog",
  description: "A lightweight creator for VuePress project.",
  base: "/",
  head: [
    ["link",{ rel: "icon",href: "/assets/logo.png" }]
  ],
  markdown: {
    lineNumbers: false,
  },
  themeConfig: {
    smoothScroll: true,
    nav: require("./config/nav"),
    sidebar: require("./config/sidebar"),
    lastUpdated: "上次更新",
    repo: "https://github.com/zpfz/vuepress-creator",
    editLinks: false,
    // algolia: {
    //   apiKey: '25626fae796133dc1e734c6bcaaeac3c',
    //   indexName: 'docsearch'
    // }
  },
};