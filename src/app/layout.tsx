import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '招标煤运输收入成本利润测算模型 v1.0',
    template: '%s | TTCT',
  },
  description:
    '招标煤运输收入成本利润测算模型 - TTCT Coal Transportation Revenue & Cost Model',
  keywords: [
    '招标煤',
    '运输模型',
    '成本测算',
    '物流成本',
  ],
  authors: [{ name: 'TTCT' }],
  openGraph: {
    title: '招标煤运输收入成本利润测算模型',
    description: '招标煤运输收入成本利润测算模型',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
