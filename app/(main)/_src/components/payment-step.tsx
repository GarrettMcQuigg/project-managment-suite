import { Card } from '@/packages/lib/components/card';
import { FormLabel } from '@/packages/lib/components/form';
import { Input } from '@/packages/lib/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { ProjectPaymentFormData } from '../project-workflow-dialog';

interface PaymentStepProps {
  payment: ProjectPaymentFormData;
  onPaymentChange: (payment: ProjectPaymentFormData) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ payment, onPaymentChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium">Project Payment</h3>

    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <FormLabel>Total Project Amount</FormLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">$</span>
            <Input
              type="number"
              value={payment.totalAmount}
              onChange={(e) => onPaymentChange({ ...payment, totalAmount: parseFloat(e.target.value) || 0 })}
              className="pl-8 border-foreground/20"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <FormLabel>Required Deposit</FormLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">$</span>
            <Input
              type="number"
              value={payment.depositRequired}
              onChange={(e) => onPaymentChange({ ...payment, depositRequired: parseFloat(e.target.value) || 0 })}
              className="pl-8 border-foreground/20"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <FormLabel>Payment Schedule</FormLabel>
          <Select value={payment.paymentSchedule} onValueChange={(value) => onPaymentChange({ ...payment, paymentSchedule: value })}>
            <SelectTrigger className="border-foreground/20">
              <SelectValue placeholder="Select payment schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_UPFRONT">Full Payment Upfront</SelectItem>
              <SelectItem value="DEPOSIT_PLUS_FINAL">Deposit + Final Payment</SelectItem>
              <SelectItem value="MILESTONE_BASED">Milestone Based</SelectItem>
              <SelectItem value="INSTALLMENTS">Regular Installments</SelectItem>
              <SelectItem value="CUSTOM">Custom Schedule</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  </div>
);

export default PaymentStep;
