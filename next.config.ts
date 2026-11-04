/** @type {import('next').NextConfig} */
const nextConfig: Record<string, unknown> = {
  allowedDevOrigins: ["192.168.100.40", "192.168.100.64", "localhost:3000"],
  async rewrites() {
    // En prod apunta al backend de Render vía API_BASE_URL; en local al
    // backend de desarrollo. Sin esto, /api/v1/* en Vercel cae al propio
    // server (localhost) y devuelve 404.
    const backend = process.env.API_BASE_URL ?? "http://127.0.0.1:9090/api/v1";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
  images: {
    // El backend local corre en 9090 (ver server.port en application.yaml del
    // backend), no en 8080: con el puerto viejo las imagenes servidas por la
    // API fallaban en local.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9090",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9090",
      },
      // Imagenes y trailers subidos directo a Cloudflare R2.
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Render sirve el backend en https://<servicio>.onrender.com. El nombre
      // exacto se decide al crear el Web Service, asi que se cubre el dominio
      // entero en vez de hardcodear un host que todavia no existe.
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
      // Avatar de Google Sign-In (se guarda la URL del claim `picture`).
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // Avatar de GitHub (proximo provider OAuth).
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Solo aplica en desarrollo. En Vercel la peticion se corta en 4.5MB
      // aunque se declare un limite mayor, por eso la media grande ya no
      // viaja por Server Actions: se sube con URL prefirmada directo a R2.
      bodySizeLimit: "512mb",
    },
  },
};

export default nextConfig;
