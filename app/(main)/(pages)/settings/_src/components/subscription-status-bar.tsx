import { Badge } from '@/packages/lib/components/badge';
import { SubscriptionStatus } from '@prisma/client';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
}

export function SubscriptionStatusBadge({ status, cancelAtPeriodEnd }: SubscriptionStatusBadgeProps) {
  if (cancelAtPeriodEnd) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
        Canceling
      </Badge>
    );
  }

  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Active
        </Badge>
      );
    case SubscriptionStatus.TRIALING:
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Trial
        </Badge>
      );
    case SubscriptionStatus.PAST_DUE:
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          Past Due
        </Badge>
      );
    case SubscriptionStatus.UNPAID:
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Unpaid
        </Badge>
      );
    case SubscriptionStatus.CANCELED:
      return (
        <Badge variant="outline" className="border-gray-500 text-gray-500">
          Canceled
        </Badge>
      );
    case SubscriptionStatus.PAUSED:
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-500">
          Paused
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
