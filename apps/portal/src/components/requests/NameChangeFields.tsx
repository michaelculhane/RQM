export default function NameChangeFields() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="new_last_name" className="block text-sm font-medium text-gray-700 mb-1">
          New Last Name
        </label>
        <input
          id="new_last_name"
          name="new_last_name"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Enter your new last name"
        />
      </div>
    </div>
  )
}
