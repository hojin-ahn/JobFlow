export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div>
        <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
              <div className="h-2 w-full bg-gray-100 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-gray-100 rounded" />
                <div className="h-8 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
