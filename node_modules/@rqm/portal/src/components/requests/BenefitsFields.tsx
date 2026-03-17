'use client'

export default function BenefitsFields() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700 mb-1">
          Inquiry Type
        </label>
        <select
          id="inquiry_type"
          name="inquiry_type"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="Enrollment">Enrollment</option>
          <option value="Coverage question">Coverage Question</option>
          <option value="Dependent change">Dependent Change</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="coverage_type" className="block text-sm font-medium text-gray-700 mb-1">
          Coverage Type
        </label>
        <select
          id="coverage_type"
          name="coverage_type"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="Medical">Medical</option>
          <option value="Dental">Dental</option>
          <option value="Vision">Vision</option>
          <option value="All">All</option>
        </select>
      </div>

      <div>
        <label htmlFor="preferred_contact" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Contact Method
        </label>
        <input
          id="preferred_contact"
          name="preferred_contact"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Email, Phone, Teams"
        />
      </div>
    </div>
  )
}
