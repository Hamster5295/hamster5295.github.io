import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";
import { RssPlugin } from "vitepress-plugin-rss";

const vitePressOptions = {
  title: "Hamster5295's Blog",
  description: "Hamsters are really CUTE!!!",

  appearance: "dark",

  head: [
    [
      "link",
      {
        rel: "icon",
        href: "https://raw.githubusercontent.com/Hamster5295/hamster5295.github.io/refs/heads/main/public/favicon.ico",
      },
    ],
  ],

  themeConfig: {
    logo: "/avatar.webp",

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "文章", link: "/articles" },
      { text: "朋友们", link: "/friends" },
    ],

    outline: {
      level: [2, 3],
      label: "本页内容"
    },

    socialLinks: [{ icon: "github", link: "https://github.com/Hamster5295" }],

    search: {
      provider: "local",
    },

    lastUpdated: {
      text: "上次更新",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
  },
  lastUpdated: true,
  externalLinkIcon: true,

  markdown: {
    container: {
      tipLabel: ':leafy_green: 提示',
      warningLabel: ':warning: 注意',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  },

  vite: {
    plugins: [
      RssPlugin({
        title: "Hamster5295's Blog",
        description: "Hamster5295 的博客，（将会）包含各种神奇的技术分享！",
        baseUrl: "https://hamster5295.github.io",
        copyright: "Copyright © 2023-present Hamster5295",
      }),
    ],
  },
};

const vitePressSidebarOptions = {
  // VitePress Sidebar's options here...
  collapsed: false,
  capitalizeFirst: true,
  useTitleFromFileHeading: true,
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,

  sortMenusByFrontmatterOrder: true,
  sortMenusOrderByDescending: true,

  excludePattern: ["friends.md"],
};

// https://vitepress.dev/reference/site-config
export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
);
