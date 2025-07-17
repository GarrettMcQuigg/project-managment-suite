"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  TooltipProps
} from "recharts"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FolderOpen,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  AlertCircle,
  CheckCircle,
  Timer,
} from "lucide-react"
import { Button } from "@/packages/lib/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/packages/lib/components/avatar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/packages/lib/components/card"
import { Progress } from "@radix-ui/react-progress"
import { Badge } from "@/packages/lib/components/badge"

// Mock data
const revenueData = [
  { month: "Jan", revenue: 12500, expenses: 8200 },
  { month: "Feb", revenue: 15200, expenses: 9100 },
  { month: "Mar", revenue: 18900, expenses: 11200 },
  { month: "Apr", revenue: 16800, expenses: 10500 },
  { month: "May", revenue: 22100, expenses: 12800 },
  { month: "Jun", revenue: 25400, expenses: 14200 },
]

const projectStatusData = [
  { status: "Active", count: 12, color: "#10b981" },
  { status: "Completed", count: 28, color: "#3b82f6" },
  { status: "On Hold", count: 3, color: "#f59e0b" },
  { status: "Planning", count: 5, color: "#8b5cf6" },
]

const timeTrackingData = [
  { day: "Mon", billable: 6.5, nonBillable: 1.5 },
  { day: "Tue", billable: 7.2, nonBillable: 0.8 },
  { day: "Wed", billable: 5.8, nonBillable: 2.2 },
  { day: "Thu", billable: 8.1, nonBillable: 0.9 },
  { day: "Fri", billable: 6.9, nonBillable: 1.1 },
]

const recentProjects = [
  {
    name: "Brand Identity for TechCorp",
    client: "TechCorp Inc.",
    progress: 85,
    status: "Active",
    dueDate: "Jan 15",
    priority: "high",
  },
  {
    name: "Website Redesign",
    client: "StartupXYZ",
    progress: 100,
    status: "Completed",
    dueDate: "Jan 10",
    priority: "medium",
  },
  {
    name: "Logo Design Package",
    client: "Local Business",
    progress: 60,
    status: "Active",
    dueDate: "Jan 20",
    priority: "low",
  },
  {
    name: "Marketing Campaign",
    client: "E-commerce Co.",
    progress: 35,
    status: "Active",
    dueDate: "Jan 25",
    priority: "high",
  },
]

const upcomingDeadlines = [
  { project: "TechCorp Brand Identity", client: "TechCorp Inc.", dueDate: "Jan 15", daysLeft: 3 },
  { project: "Logo Package", client: "Local Business", dueDate: "Jan 20", daysLeft: 8 },
  { project: "Marketing Campaign", client: "E-commerce Co.", dueDate: "Jan 25", daysLeft: 13 },
]

const recentInvoices = [
  { number: "INV-2024-001", client: "TechCorp Inc.", amount: 5500, status: "Paid", date: "Jan 10" },
  { number: "INV-2024-002", client: "StartupXYZ", amount: 3200, status: "Overdue", date: "Jan 5" },
  { number: "INV-2024-003", client: "Local Business", amount: 1800, status: "Sent", date: "Jan 12" },
]

const clientActivity = [
  { name: "Sarah Johnson", company: "TechCorp", avatar: "SJ", lastContact: "2 hours ago", status: "active" },
  { name: "Mike Chen", company: "StartupXYZ", avatar: "MC", lastContact: "1 day ago", status: "active" },
  { name: "Emma Davis", company: "Local Biz", avatar: "ED", lastContact: "3 days ago", status: "pending" },
  { name: "Alex Rivera", company: "E-commerce", avatar: "AR", lastContact: "5 days ago", status: "active" },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          {/* <p className="text-gray-600 mt-1">Here's your business overview for today</p> */}
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Revenue Chart - Large */}
          <Card className="lg:col-span-8 border-border/50 hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Revenue & Expenses</CardTitle>
                <CardDescription>Monthly comparison over the last 6 months</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyan-500"></div>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                  <span>Expenses</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(175, 90%, 35%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(175, 90%, 35%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 0%, 60%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(0, 0%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`,
                        name === 'revenue' ? 'Revenue' : 'Expenses'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(0, 0%, 60%)"
                      strokeWidth={2}
                      fill="url(#expensesGradient)"
                      name="expenses"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(175, 90%, 35%)"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      name="revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics - Vertical Stack */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/50 hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$25,400</p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+14.9% from last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <div className="flex items-center text-sm text-blue-600 mt-1">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+2 new this week</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">34.5h</p>
                    <div className="flex items-center text-sm text-orange-600 mt-1">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      <span>-2.1h from last week</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Project Status Chart */}
          <Card className="lg:col-span-4 border-border/50 hover:shadow-lg transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Project Distribution</CardTitle>
              <CardDescription>Current project status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={projectStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={60}>
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} projects`,
                        props.payload.status
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {projectStatusData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.status}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card className="lg:col-span-8 border-border/50 hover:shadow-lg transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Time Tracking</CardTitle>
              <CardDescription>Billable vs non-billable hours breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={timeTrackingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value} hours`,
                        name === 'billable' ? 'Billable Hours' : 'Non-billable Hours'
                      ]}
                    />
                    <Bar dataKey="billable" fill="hsl(175, 90%, 35%)" radius={[2, 2, 0, 0]} name="billable" />
                    <Bar dataKey="nonBillable" fill="hsl(0, 0%, 60%)" radius={[2, 2, 0, 0]} name="nonBillable" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Projects */}
          <Card className="border-border/50 hover:shadow-lg transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
              <CardDescription>Current project progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.slice(0, 3).map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                      <p className="text-xs text-gray-500">{project.client}</p>
                    </div>
                    <Badge variant={project.status === "Active" ? "default" : "secondary"} className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="border-border/50 hover:shadow-lg transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
              <CardDescription>Projects requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      deadline.daysLeft <= 5 ? "bg-red-100" : "bg-yellow-100"
                    }`}
                  >
                    <Calendar className={`h-4 w-4 ${deadline.daysLeft <= 5 ? "text-red-600" : "text-yellow-600"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{deadline.project}</p>
                    <p className="text-xs text-gray-500">{deadline.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">{deadline.daysLeft} days</p>
                    <p className="text-xs text-gray-500">{deadline.dueDate}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="border-border/50 hover:shadow-lg transition-all duration-200 group">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
              <CardDescription>Latest billing activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        invoice.status === "Paid"
                          ? "bg-green-100"
                          : invoice.status === "Overdue"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                      }`}
                    >
                      {invoice.status === "Paid" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : invoice.status === "Overdue" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Timer className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{invoice.number}</p>
                      <p className="text-xs text-gray-500">{invoice.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">${invoice.amount.toLocaleString()}</p>
                    <Badge
                      variant={
                        invoice.status === "Paid" ? "default" : invoice.status === "Overdue" ? "destructive" : "outline"
                      }
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
