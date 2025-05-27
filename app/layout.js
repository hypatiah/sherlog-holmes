import '../styles/globals.css';


export const metadata = {
  title: 'SherLog Holmes',
  description: 'Solving the mysteries of your website visitors, one case at a time.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-parchment font-serifMystery text-detectiveBrown min-h-screen">
        {children}
      </body>
    </html>
  );
}