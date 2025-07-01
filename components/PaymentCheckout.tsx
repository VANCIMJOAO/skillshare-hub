'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Building2, Smartphone, DollarSign, Shield, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  fees: string;
  processingTime: string;
  icon: string;
}

interface Workshop {
  id: string;
  title: string;
  price: number;
  startsAt: string;
  endsAt: string;
  mode: 'online' | 'presencial';
  instructor: {
    name: string;
    avatar?: string;
  };
}

interface PaymentCheckoutProps {
  workshop: Workshop;
  onPaymentSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or American Express',
    fees: '2.9% + $0.30',
    processingTime: 'Instant',
    icon: 'credit-card'
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    description: 'Pay directly from your bank account',
    fees: '1.5% + $0.25',
    processingTime: 'Instant',
    icon: 'credit-card'
  },
  {
    id: 'pix',
    name: 'PIX',
    description: 'Instant payment via PIX (Brazil)',
    fees: 'Free',
    processingTime: 'Instant',
    icon: 'smartphone'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Transfer directly from your bank',
    fees: '$1.00',
    processingTime: '1-3 business days',
    icon: 'building2'
  },
];

export default function PaymentCheckout({ workshop, onPaymentSuccess, onCancel }: PaymentCheckoutProps) {
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    pixKey: '',
    bankAccount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const selectedPaymentMethod = MOCK_PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const totalAmount = workshop.price;
  const fees = selectedPaymentMethod ? calculateFees(totalAmount, selectedPaymentMethod) : 0;
  const finalAmount = totalAmount + fees;

  function calculateFees(amount: number, method: PaymentMethod): number {
    if (method.fees === 'Free') return 0;
    if (method.fees.includes('%')) {
      const [percentage, fixed] = method.fees.split(' + $');
      const percentageAmount = amount * (parseFloat(percentage.replace('%', '')) / 100);
      const fixedAmount = parseFloat(fixed) || 0;
      return percentageAmount + fixedAmount;
    }
    return parseFloat(method.fees.replace('$', '')) || 0;
  }

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setError(null);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    setStep('details');
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment
      const createResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          workshopId: workshop.id,
          amount: finalAmount,
          method: selectedMethod,
          description: `Payment for workshop: ${workshop.title}`,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create payment');
      }

      const payment = await createResponse.json();
      setPaymentId(payment.id);
      setStep('processing');

      // Step 2: Process payment (mock)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      const processResponse = await fetch(`/api/payments/${payment.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodDetails: getPaymentMethodDetails(),
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Payment processing failed');
      }

      const processedPayment = await processResponse.json();

      if (processedPayment.status === 'completed') {
        setStep('success');
        setTimeout(() => {
          onPaymentSuccess(processedPayment.id);
        }, 2000);
      } else {
        throw new Error(processedPayment.failureReason || 'Payment failed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodDetails = (): string => {
    switch (selectedMethod) {
      case 'credit_card':
      case 'debit_card':
        return paymentDetails.cardNumber;
      case 'pix':
        return paymentDetails.pixKey;
      case 'bank_transfer':
        return paymentDetails.bankAccount;
      default:
        return '';
    }
  };

  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="w-5 h-5" />;
      case 'building2':
        return <Building2 className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <h3 className="text-lg font-semibold">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <Shield className="w-4 h-4 inline mr-1" />
                Your payment is secured with 256-bit encryption
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
            <p className="text-gray-600">You have been enrolled in the workshop.</p>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <h4 className="font-medium text-green-800 mb-2">Payment Details</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>Workshop: {workshop.title}</p>
                <p>Amount: ${finalAmount.toFixed(2)}</p>
                <p>Method: {selectedPaymentMethod?.name}</p>
                {paymentId && <p>Payment ID: {paymentId}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800">Payment Failed</h3>
            <p className="text-gray-600">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => { setStep('method'); setError(null); }} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button onClick={onCancel} variant="ghost" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Workshop Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Complete Your Purchase</span>
            <Badge variant="secondary">{workshop.mode}</Badge>
          </CardTitle>
          <CardDescription>
            You're about to enroll in {workshop.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Workshop:</span>
              <span className="font-medium">{workshop.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Instructor:</span>
              <span>{workshop.instructor.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Start Date:</span>
              <span>{new Date(workshop.startsAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-bold">${workshop.price.toFixed(2)}</span>
            </div>
            {fees > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing Fee:</span>
                <span>${fees.toFixed(2)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      {step === 'method' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
            <CardDescription>Choose how you'd like to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
              <div className="space-y-4">
                {MOCK_PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <label
                      htmlFor={method.id}
                      className="flex-1 flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getMethodIcon(method.icon)}
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{method.fees}</div>
                        <div className="text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {method.processingTime}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mt-6">
              <Button onClick={onCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      {step === 'details' && selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getMethodIcon(selectedPaymentMethod.icon)}
              {selectedPaymentMethod.name} Details
            </CardTitle>
            <CardDescription>
              Enter your payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
                <>
                  <div>
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={paymentDetails.name}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === 'pix' && (
                <div>
                  <Label htmlFor="pixKey">PIX Key</Label>
                  <Input
                    id="pixKey"
                    placeholder="email@example.com or phone number"
                    value={paymentDetails.pixKey}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, pixKey: e.target.value })}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    You'll receive a QR code to complete the payment instantly.
                  </p>
                </div>
              )}

              {selectedMethod === 'bank_transfer' && (
                <div>
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Account number"
                    value={paymentDetails.bankAccount}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, bankAccount: e.target.value })}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Transfer may take 1-3 business days to process.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <p className="text-sm text-blue-700">
                Your payment information is encrypted and secure. We never store your full payment details.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setStep('method')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handlePayment} disabled={loading} className="flex-1">
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Pay ${finalAmount.toFixed(2)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
