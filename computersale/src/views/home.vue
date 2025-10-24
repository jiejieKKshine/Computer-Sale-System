<template>
    <div>
        <img src="https://img.zcool.cn/community/019ovhsl5oftcqdw5msd9g3334.png?x-oss-process=image/auto-orient,1/resize,m_lfit,w_1280,limit_1/sharpen,100/quality,q_100" alt="Image" />
    </div>
</template>

<script>
export default {
    name: 'HomeComponent'
}
</script>

<style scoped>
img {
    max-width: 1280px; /* 设置最大宽度为1280像素 */
    width: 100%; /* 使图片宽度适应容器宽度 */
    max-height: 720px; /* 设置最大高度为720像素 */
    height: auto; /* 使图片高度按照比例自动调整 */
    object-fit: cover; /* 如果图片超过最大高度，裁剪图片而不是拉伸 */
}
</style>