'use client';

import { useEffect } from 'react';

// import Hero from './_src/hero';
// import Newsletter from './_src/newsletter';
// import Products from './_src/products';
// import AppShowcase from './_src/app-showcase';

export default function Home() {
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      localStorage.removeItem('email');
    }
  }, []);

  return (
    <>
      <div className="flex flex-col min-h-screen-minus-header overflow-hidden supports-[overflow:clip]:overflow-clip">
        <span className="flex justify-center my-auto">Landing Page</span>
        {/* <Hero />
        <Products />
        <AppShowcase />
        <Newsletter /> */}
      </div>
    </>
  );
}
