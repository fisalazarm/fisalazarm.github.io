/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  // Use folder/index.html pattern to play nicely with Pages hosting
  trailingSlash: true,
  // Images: disable optimization (no server in static export)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/master/sprites/pokemon/**',
      },
    ],
  },
  // Allow hosting under a subpath like /pokedex on project pages
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

module.exports = nextConfig;
