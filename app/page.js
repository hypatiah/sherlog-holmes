'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function InsightCard({ title, value }) {
  return (
    <div className="bg-white border shadow-md rounded-lg p-5 text-center hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
      <p className="text-3xl font-bold text-blue-700 mt-1">{value}</p>
    </div>
  );
}

export default function VisitorDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchVisitors = async () => {
      const res = await fetch('/api/visitors');
      const data = await res.json();
      setVisitors(data);
      setFiltered(data);
    };
    fetchVisitors();
  }, []);

  useEffect(() => {
    const filtered = visitors.filter(v => {
      const matchesSearch = v.company?.toLowerCase().includes(search.toLowerCase());
      const matchesCompany = !companyFilter || v.company === companyFilter;
      const matchesLocation = !locationFilter || v.location === locationFilter;
      const visitDate = new Date(v.timestamp);
      const inDateRange =
        (!startDate || visitDate >= new Date(startDate)) &&
        (!endDate || visitDate <= new Date(endDate));
      return matchesSearch && matchesCompany && matchesLocation && inDateRange;
    });
    setFiltered(filtered);
  }, [search, companyFilter, locationFilter, startDate, endDate, visitors]);

  const totalVisits = filtered.length;
  const avgTimeOnSite = Math.round(
    filtered.reduce((sum, v) => sum + (v.timeOnPage || 0), 0) / (filtered.length || 1)
  );

  const companies = [...new Set(visitors.map(v => v.company))];
  const locations = [...new Set(visitors.map(v => v.location))];

  // Build trend data per day per company (last 14 days)
const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return d.toISOString().split('T')[0];
});

// Group by company/date
const companyTrendMap = {};
filtered.forEach(v => {
  const date = new Date(v.timestamp).toISOString().split('T')[0];
  if (!days.includes(date)) return;
  const company = v.company || 'Unknown';
  if (!companyTrendMap[company]) {
    companyTrendMap[company] = {};
  }
  companyTrendMap[company][date] = (companyTrendMap[company][date] || 0) + 1;
});

const companyColors = [
  '#0052CC', '#00B2E3', '#36B37E', '#FF5630', '#6554C0', '#FFAB00', '#00A3BF', '#5243AA'
];

const trendData = {
  labels: days,
  datasets: Object.entries(companyTrendMap).slice(0, 6).map(([company, data], i) => ({
    label: company,
    data: days.map(day => data[day] || 0),
    borderColor: companyColors[i % companyColors.length],
    backgroundColor: `${companyColors[i % companyColors.length]}33`,
    fill: true,
    tension: 0.3,
  }))
};


  // --- Additional Insights ---
  const now = new Date();
  const past7Days = new Date(now);
  past7Days.setDate(now.getDate() - 7);
  const recentVisitors = filtered.filter(v => new Date(v.timestamp) >= past7Days);

  const companyStats = {};
  recentVisitors.forEach(v => {
    if (!v.company) return;
    if (!companyStats[v.company]) {
      companyStats[v.company] = { count: 0, time: 0 };
    }
    companyStats[v.company].count += 1;
    companyStats[v.company].time += v.timeOnPage || 0;
  });
  const topCompanies = Object.entries(companyStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const pageViews = {};
  filtered.forEach(v => {
    if (!v.url) return;
    pageViews[v.url] = (pageViews[v.url] || 0) + 1;
  });
  const mostViewedPages = Object.entries(pageViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const locationCounts = {};
  filtered.forEach(v => {
    if (!v.location) return;
    locationCounts[v.location] = (locationCounts[v.location] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentActivity = [...filtered]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <main className="bg-gray-50 min-h-screen p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-4xl font-bold text-blue-700 mb-8">Visitor Insights Dashboard</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search company..."
          className="border border-gray-300 p-2 rounded-md shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 p-2 rounded-md shadow-sm"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="border border-gray-300 p-2 rounded-md shadow-sm"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="border p-2 rounded-md shadow-sm w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded-md shadow-sm w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <InsightCard title="Total Visits" value={totalVisits} />
        <InsightCard title="Avg Time on Site" value={`${avgTimeOnSite} sec`} />
        <InsightCard title="Unique Companies" value={new Set(filtered.map(v => v.company)).size} />
      </div>

      {/* Top Companies */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Top Visiting Companies (Last 7 Days)</h2>
        <ul className="bg-white rounded-lg shadow p-4 space-y-2">
          {topCompanies.map(([company, stats], i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{company}</span>
              <span>{stats.count} visits — Avg time: {Math.round(stats.time / stats.count)}s</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Visit Trends */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Visit Trends by Company (Last 14 Days)</h2>
          <Line
            data={trendData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false,
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Visits',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
              },
            }}
          />
        </section>

              {/* Most Viewed Pages */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Most Viewed Pages</h2>
        <ul className="bg-white rounded-lg shadow p-4 space-y-2">
          {mostViewedPages.map(([url, count], i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{url}</span>
              <span>{count} views</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top Locations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Top Visitor Locations</h2>
        <ul className="bg-white rounded-lg shadow p-4 space-y-2">
          {topLocations.map(([location, count], i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{location}</span>
              <span>{count} visits</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Activity Feed */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Recent Visitor Activity</h2>
        <ul className="bg-white rounded-lg shadow p-4 space-y-2 text-sm">
          {recentActivity.map((v, i) => (
            <li key={i} className="border-b pb-2">
              <div className="flex justify-between">
                <span>{v.company || 'Unknown'} ({v.location})</span>
                <span>{new Date(v.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-gray-600">Visited: {v.url} — {v.timeOnPage}s on site</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
