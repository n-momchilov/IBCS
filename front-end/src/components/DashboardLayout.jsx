import './DashboardLayout.css'

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard">
            <header className="dashboard-header">Contact Ons</header>
            <main className="dashboard-content">{children}</main>
        </div>
    )
}

export default DashboardLayout
