import { vendors, services, payments } from "@/data/dummy"
import { Card, CardContent } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"

export default function Dashboard() {
  const activeServices = services.filter(s => s.active).length

  const today = new Date()
  const oneMonthLater = new Date()
  oneMonthLater.setMonth(today.getMonth() + 1)

  const upcomingPayments = payments.filter(p => {
    const due = new Date(p.dueDate)
    return due <= oneMonthLater
  }).length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full lg:ml-0 ml-0 pt-16 lg:pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base text-gray-600">Total Vendors</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{vendors.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base text-gray-600">Active Services</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{activeServices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base text-gray-600">Payments {'<'} 1 Month</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{upcomingPayments}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}