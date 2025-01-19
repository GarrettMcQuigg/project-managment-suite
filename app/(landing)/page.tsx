import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import LandingPage from './_src/temp-landing-page';

// import Hero from './_src/hero';
// import Newsletter from './_src/newsletter';
// import Products from './_src/products';
// import AppShowcase from './_src/app-showcase';

export default async function Home() {
  let currentUser = await getCurrentUser();

  if (!currentUser) {
    currentUser = null;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen-minus-header overflow-hidden supports-[overflow:clip]:overflow-clip">
        <LandingPage currentUser={currentUser} />
        {/* <Hero />
        <Products />
        <AppShowcase />
        <Newsletter /> */}
      </div>
    </>
  );
}
