import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
// import Header from './_src/header';
// import Footer from './_src/footer';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <>
      {/* <Header currentUser={currentUser} /> */}
      {children}
      {/* <Footer /> */}
    </>
  );
}
