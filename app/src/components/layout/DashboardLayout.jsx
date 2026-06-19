import Header from './Header'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="px-8 py-7 max-w-[1280px] mx-auto">{children}</main>
    </div>
  )
}
