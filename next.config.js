/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Esto obliga a Vercel a publicar aunque haya errores de Typescript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto ignora las advertencias de "orden" en el código
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig