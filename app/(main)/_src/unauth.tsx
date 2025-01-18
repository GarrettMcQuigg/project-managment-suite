'use client';

import { fetcher } from '@packages/lib/helpers/fetcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@packages/lib/components/card';
// import Logo from '@packages/lib/components/logo';
// import GridBackground from '@packages/lib/components/grid-background';
import { useEffect } from 'react';
import { API_AUTH_SIGNOUT_ROUTE, ROOT_ROUTE } from '@/packages/lib/routes';
import PageContent from '@/packages/lib/components/page-content';

export function Unauth() {
  useEffect(() => {
    const signOut = async () => {
      await fetcher({ url: API_AUTH_SIGNOUT_ROUTE });
    };
    signOut();
  }, []);

  return (
    <div className="relative flex justify-center items-center h-full mt-24">
      {/* <GridBackground /> */}

      <PageContent>
        <Card>
          <CardHeader className="flex flex-col items-center">
            {/* <Logo iconOnly={true} /> */}
            <CardTitle className="mt-8">UNAUTHORIZED ACCESS</CardTitle>
            <CardDescription>You're being signed out from the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              If you are not redirected, please click{' '}
              <a href={ROOT_ROUTE} className="text-blue-500 hover:underline">
                here
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </PageContent>
    </div>
  );
}
