'use client'

export default function SystemAccessFields() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="system_name" className="block text-sm font-medium text-gray-700 mb-1">
          System Name
        </label>
        <input
          id="system_name"
          name="system_name"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Salesforce, SAP, GitHub"
        />
      </div>

      <div>
        <label htmlFor="access_type" className="block text-sm font-medium text-gray-700 mb-1">
          Access Type
        </label>
        <select
          id="access_type"
          name="access_type"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="New access">New Access</option>
          <option value="Modify">Modify</option>
          <option value="Remove">Remove</option>
        </select>
      </div>

      <div>
        <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-1">
          Business Justification
        </label>
        <textarea
          id="justification"
          name="justification"
          rows={3}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          placeholder="Explain why this access is needed"
        />
      </div>

      <div>
        <label htmlFor="required_by_date" className="block text-sm font-medium text-gray-700 mb-1">
          Required By Date
        </label>
        <input
          id="required_by_date"
          name="required_by_date"
          type="date"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  )
}
