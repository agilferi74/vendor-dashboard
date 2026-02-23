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
    <div className="flex">
      <Sidebar />
      <div className="p-10 w-full">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3>Total Vendors</h3>
              <p className="text-3xl font-bold">{vendors.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3>Active Services</h3>
              <p className="text-3xl font-bold">{activeServices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3>Payments {'<'} 1 Month</h3>
              <p className="text-3xl font-bold">{upcomingPayments}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}