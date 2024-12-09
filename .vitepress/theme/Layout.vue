<script type="ts" setup>
import DefaultTheme from 'vitepress/theme'
import { useRouter } from "vitepress";
import mediumZoom from 'medium-zoom'
import { watch, nextTick, onMounted } from "vue";

let { route } = useRouter();

const initZoom = () => {
    mediumZoom('.main img', { background: 'var(--vp-c-bg)' });
}

onMounted(() => {

    initZoom();

    // 监听路由变化
    watch(() => route.path, () => {
        nextTick(() => {
            initZoom();
        });
    }
    );
});

const { Layout } = DefaultTheme

</script>

<!-- .vitepress/theme/Layout.vue -->
<template>
    <!-- 这里的Layout不是递归组件, 而是默认主题的Layout组件, 相当于组件的入口, 若不使用此组件, 那么整个网页都没有内容 -->
    <Layout></Layout>
</template>