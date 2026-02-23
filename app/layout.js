import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: '美容師国試対策',
  description: '美容師国家試験 筆記試験対策問題集',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-pink-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
