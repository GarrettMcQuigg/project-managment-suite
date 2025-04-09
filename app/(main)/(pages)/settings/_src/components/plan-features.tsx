import { CheckCircle2 } from 'lucide-react';

interface PlanFeature {
  id: string;
  name: string;
  description?: string | null;
}

interface PlanFeaturesListProps {
  features: PlanFeature[];
}

export function PlanFeaturesList({ features }: PlanFeaturesListProps) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {features.map((feature) => (
        <li key={feature.id} className="flex items-start">
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-medium">{feature.name}</p>
            {feature.description && <p className="text-sm text-muted-foreground">{feature.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
