// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import { Theme } from "vitepress";
import Layout from "./Layout.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  // Layout: BlogLayout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
