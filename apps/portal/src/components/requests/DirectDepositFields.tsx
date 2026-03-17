'use client'

export default function DirectDepositFields() {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        Note: No actual account numbers are collected in this demo.
      </div>

      <div>
        <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
          Bank Name
        </label>
        <input
          id="bank_name"
          name="bank_name"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. TD Bank, RBC, Chase"
        />
      </div>

      <div>
        <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-1">
          Account Type
        </label>
        <select
          id="account_type"
          name="account_type"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="Chequing">Chequing</option>
          <option value="Savings">Savings</option>
        </select>
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  )
}
