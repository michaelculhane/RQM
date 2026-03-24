export default function WgiFields() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="eligibility_date" className="block text-sm font-medium text-gray-700 mb-1">
          On which date do you believe you are eligible to receive the WGI?
        </label>
        <input
          id="eligibility_date"
          name="eligibility_date"
          type="date"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
    </div>
  )
}
