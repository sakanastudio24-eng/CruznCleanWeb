import { EmailPreviewClient, type EmailPreviewConfig, type PreviewTab } from '@/app/email-preview/email-preview-client';
import {
  buildStripeCustomerReceiptEmail,
  buildStripeOwnerNotificationEmail,
  type StripeCustomerReceiptInput,
} from '@/lib/email/stripe-receipts';

const MOCK_RECEIPT_INPUT: StripeCustomerReceiptInput = {
  checkoutSessionId: 'cs_test_mock_123',
  paymentIntentId: 'pi_test_mock_123',
  clientReferenceId: 'bk_mock_123456',
  bookingId: 'bk_mock_123456',
  orderId: 'bk_mock_123456',
  customerEmail: 'jordan@example.com',
  customerName: 'Jordan Cruz',
  customerPhone: '(555) 123-4567',
  zipCode: '92507',
  serviceAddress: '123 Mockingbird Lane, Riverside, CA 92507',
  vehicleSummary: '2022 Tesla Model 3 (White) - Sedan/Coupe',
  servicesSummary: 'Maintenance Detail, 3 Year Ceramic Coating',
  estimatedServiceTotalCents: 59800,
  depositSubtotalBeforeDiscountCents: 6000,
  depositPaidTodayCents: 6000,
  discountAppliedCents: null,
  remainingBalanceCents: 53800,
};

/**
 * Builds safe mock previews from the same receipt builders used by the Stripe webhook.
 */
function getPreviewConfigs(): Record<PreviewTab, EmailPreviewConfig> {
  const customerReceipt = buildStripeCustomerReceiptEmail(MOCK_RECEIPT_INPUT);
  const ownerNotification = buildStripeOwnerNotificationEmail(MOCK_RECEIPT_INPUT);

  return {
    customer: {
      title: 'Customer Receipt Preview',
      subject: customerReceipt.subject,
      description: 'Sent to the customer after Stripe confirms the booking deposit payment.',
      htmlPreview: customerReceipt.html,
    },
    owner: {
      title: 'Owner Notification Preview',
      subject: ownerNotification.subject,
      description: 'Sent to the owner after Stripe confirms the booking deposit payment.',
      htmlPreview: ownerNotification.html,
    },
  };
}

/**
 * Renders public mock email previews without sending email or calling provider APIs.
 */
export default function EmailPreviewPage(): JSX.Element {
  return <EmailPreviewClient previews={getPreviewConfigs()} />;
}
