// next.config.mjs
const isGH = process.env.DEPLOY_TARGET === 'github';
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGH && repo ? `/${repo}` : '',
  assetPrefix: isGH && repo ? `/${repo}/` : undefined,
};

export default config;


