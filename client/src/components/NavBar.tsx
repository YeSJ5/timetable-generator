import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/manage', label: 'Manage Data', icon: '📝' },
    { path: '/generate', label: 'Generate', icon: '⚡' },
    { path: '/view', label: 'View Timetable', icon: '📅' },
    { path: '/view-all', label: 'All Timetables', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎓</div>
            <h1 className="text-xl font-bold">AI Timetable Generator</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'hover:bg-blue-800 hover:bg-opacity-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

