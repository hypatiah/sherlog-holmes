
export const metadata = {
  title: 'SherLog Holmes',
  description: 'Solving the mysteries of your website visitors, one case at a time.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}