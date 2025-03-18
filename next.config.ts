import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['avatars.githubusercontent.com'], // 允许加载的图片源
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 默认支持的尺寸
    imageSizes: [16, 32, 48, 64, 128, 256, 384], // 默认支持的图片尺寸
    path: '/_next/image', // 自定义图片路径
    loader: 'default', // 默认的图片加载器（也可以配置为 `imgix`、`cloudinary` 等）
  },
};

export default nextConfig;
