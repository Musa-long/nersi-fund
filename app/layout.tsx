import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NERSI Portal — ₦50,000 Relief Payment',
  description:
    'National Emergency Relief and Stabilisation Intervention. Register your details for verification under the Federal Government ₦50,000 relief payment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
