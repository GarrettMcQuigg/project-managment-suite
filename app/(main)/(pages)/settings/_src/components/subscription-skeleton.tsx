import { Card, CardHeader, CardContent, CardFooter } from '@/packages/lib/components/card';
import { Skeleton } from '@/packages/lib/components/skeleton';

export function SubscriptionSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-6 w-[100px]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-5 w-[120px]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-[120px]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          <Skeleton className="h-[1px] w-full" />

          <div className="space-y-4">
            <Skeleton className="h-5 w-[120px]" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[150px]" />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4">
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="border-t p-4">
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="border-t p-4">
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
