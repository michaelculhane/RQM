'use client'

export default function AddressFields() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1
        </label>
        <input
          id="address_line1"
          name="address_line1"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="123 Main Street"
        />
      </div>

      <div>
        <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="address_line2"
          name="address_line2"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Suite 400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Toronto"
          />
        </div>

        <div>
          <label htmlFor="province_state" className="block text-sm font-medium text-gray-700 mb-1">
            Province / State
          </label>
          <input
            id="province_state"
            name="province_state"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="ON"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="postal_zip" className="block text-sm font-medium text-gray-700 mb-1">
            Postal / ZIP Code
          </label>
          <input
            id="postal_zip"
            name="postal_zip"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="M5V 3A8"
          />
        </div>

        <div>
          <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700 mb-1">
            Effective Date
          </label>
          <input
            id="effective_date"
            name="effective_date"
            type="date"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
    </div>
  )
}
