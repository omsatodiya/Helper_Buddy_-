import PaymentButton from '@/components/PaymentButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Complete Your Payment
            </h1>
            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-semibold text-indigo-600">
                    ₹1000
                  </span>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <PaymentButton amount={1000} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
