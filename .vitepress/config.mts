import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

const vitePressOptions = {
  title: "Hamster5295's Blog",
  description: "Hamsters are really CUTE!!!",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],

  themeConfig: {
    logo: "/avatar.webp",

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "朋友们", link: "/friends" },
    ],

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
};

const vitePressSidebarOptions = {
  // VitePress Sidebar's options here...
  collapsed: false,
  capitalizeFirst: true,
  useTitleFromFileHeading: true,
  useFolderTitleFromIndexFile: true,

  sortMenusByFrontmatterOrder: true,
  sortMenusOrderByDescending: true,

  excludePattern: ["friends.md"],
};

// https://vitepress.dev/reference/site-config
export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
);
