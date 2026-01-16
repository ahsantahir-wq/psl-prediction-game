'use client'

import { useState } from 'react'

export default function LoadCreditsPage() {
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [selectedMethod, setSelectedMethod] = useState<'easypaisa' | 'jazzcash' | null>(null)

  const creditPackages = [
    { amount: 100, bonus: 0, price: 'PKR 100' },
    { amount: 500, bonus: 50, price: 'PKR 500' },
    { amount: 1000, bonus: 150, price: 'PKR 1,000' },
    { amount: 2500, bonus: 500, price: 'PKR 2,500' },
  ]

  const handlePurchase = () => {
    if (!selectedMethod) {
      alert('Please select a payment method')
      return
    }

    alert(`Payment integration coming soon!\n\nYou selected:\n${selectedMethod.toUpperCase()}\nAmount: ${selectedAmount} credits`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">💰 Load Credits</h1>
            <p className="text-sm text-gray-600">Top up your prediction credits</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Credit Packages */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Credit Package</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <button
                key={pkg.amount}
                onClick={() => setSelectedAmount(pkg.amount)}
                className={`p-6 rounded-xl border-2 transition ${
                  selectedAmount === pkg.amount
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🪙</div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {pkg.amount}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Credits</div>
                  {pkg.bonus > 0 && (
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mb-2">
                      +{pkg.bonus} Bonus!
                    </div>
                  )}
                  <div className="text-lg font-semibold text-blue-600">
                    {pkg.price}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Note:</strong> Credits are used to make predictions during live PSL matches. 
              The more accurate your predictions, the more credits you earn!
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EasyPaisa */}
            <button
              onClick={() => setSelectedMethod('easypaisa')}
              className={`p-6 rounded-xl border-2 transition ${
                selectedMethod === 'easypaisa'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  EP
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-800">EasyPaisa</div>
                  <div className="text-sm text-gray-600">
                    Pay via EasyPaisa mobile wallet
                  </div>
                </div>
              </div>
            </button>

            {/* JazzCash */}
            <button
              onClick={() => setSelectedMethod('jazzcash')}
              className={`p-6 rounded-xl border-2 transition ${
                selectedMethod === 'jazzcash'
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  JC
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-800">JazzCash</div>
                  <div className="text-sm text-gray-600">
                    Pay via JazzCash mobile wallet
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Credits</span>
              <span className="font-bold text-gray-800">{selectedAmount} 🪙</span>
            </div>
            
            {creditPackages.find(p => p.amount === selectedAmount)?.bonus ? (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Bonus Credits</span>
                <span className="font-bold text-green-600">
                  +{creditPackages.find(p => p.amount === selectedAmount)?.bonus} 🪙
                </span>
              </div>
            ) : null}
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold text-gray-800">
                {selectedMethod ? selectedMethod.toUpperCase() : 'Not selected'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4">
              <span className="text-lg font-bold text-gray-800">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                {creditPackages.find(p => p.amount === selectedAmount)?.price}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!selectedMethod}
            className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition ${
              selectedMethod
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedMethod ? '💳 Proceed to Payment' : '⚠️ Select Payment Method'}
          </button>
        </div>

        {/* Information */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📌 Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Credits are instantly added to your account after successful payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Use credits to make predictions during live PSL matches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Earn more credits by making accurate predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>All transactions are secure and encrypted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>No real money withdrawals - credits are for prediction purposes only</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
