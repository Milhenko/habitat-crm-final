import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CRM Habitat",
    description: "Sistema de gestión de leads inmobiliarios",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <AuthProvider>
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}