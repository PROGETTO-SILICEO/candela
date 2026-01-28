import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'CANDELA - Fact-checking con dubbi',
    description: 'Verifica notizie con trasparenza e dubbi espliciti. Powered by Nova - Progetto Siliceo.',
    keywords: ['fact-checking', 'notizie', 'verifica', 'AI', 'trasparenza'],
    authors: [{ name: 'Progetto Siliceo' }],
    openGraph: {
        title: 'CANDELA - Fact-checking con dubbi',
        description: 'Verifica notizie con trasparenza. I dubbi sono parte del processo.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="it">
            <body className="min-h-screen flex flex-col">
                {children}
            </body>
        </html>
    );
}
