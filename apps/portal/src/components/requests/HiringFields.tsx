'use client'

export default function HiringFields() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
          Job Title
        </label>
        <input
          id="job_title"
          name="job_title"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Senior Software Engineer"
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <input
          id="department"
          name="department"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Engineering"
        />
      </div>

      <div>
        <label htmlFor="headcount_type" className="block text-sm font-medium text-gray-700 mb-1">
          Headcount Type
        </label>
        <select
          id="headcount_type"
          name="headcount_type"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="Backfill">Backfill</option>
          <option value="New">New</option>
        </select>
      </div>

      <div>
        <label htmlFor="target_start_date" className="block text-sm font-medium text-gray-700 mb-1">
          Target Start Date
        </label>
        <input
          id="target_start_date"
          name="target_start_date"
          type="date"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="hiring_manager" className="block text-sm font-medium text-gray-700 mb-1">
          Hiring Manager
        </label>
        <input
          id="hiring_manager"
          name="hiring_manager"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Full name of hiring manager"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">Is this budgeted?</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="is_budgeted"
              value="true"
              defaultChecked
              className="text-indigo-600 focus:ring-indigo-500"
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="is_budgeted"
              value="false"
              className="text-indigo-600 focus:ring-indigo-500"
            />
            No
          </label>
        </div>
      </div>
    </div>
  )
}
