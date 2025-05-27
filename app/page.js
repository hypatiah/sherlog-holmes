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
    <div className="bg-parchment border border-detectiveBrown shadow-subtleGlow rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-sm font-serifMystery uppercase text-detectiveBrown tracking-widest">{title}</h3>
      <p className="text-3xl font-bold text-clueRed mt-2">{value}</p>
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

  const companies = [...new Set(visitors.map(v => v.company))].filter(Boolean);
  const locations = [...new Set(visitors.map(v => v.location))].filter(Boolean);

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
    '#4B382A', // detectiveBrown
    '#B33A3A', // clueRed
    '#7D7D7D', // fogGray
    '#6554C0', // deep purple accent
    '#0052CC', // deep blue accent
  ];

  const trendData = {
    labels: days,
    datasets: Object.entries(companyTrendMap).slice(0, 5).map(([company, data], i) => ({
      label: company,
      data: days.map(day => data[day] || 0),
      borderColor: companyColors[i % companyColors.length],
      backgroundColor: `${companyColors[i % companyColors.length]}33`,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }))
  };

  // Additional Insights
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

  
function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

  return (
    <main className="bg-parchment min-h-screen p-8 max-w-7xl mx-auto font-serifMystery text-detectiveBrown">
      <h1 className="text-5xl font-bold mb-8 border-b-4 border-clueRed pb-2">SherLog Holmes</h1>
      <h3>Solving the mysteries of your website visitors, one case at a time.</h3>

      <h2>Visitor Insights Dashboard</h2>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search company..."
          className="border border-fogGray p-3 rounded-md shadow-subtleGlow focus:outline-none focus:ring-2 focus:ring-clueRed"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-fogGray p-3 rounded-md shadow-subtleGlow focus:outline-none focus:ring-2 focus:ring-clueRed"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="border border-fogGray p-3 rounded-md shadow-subtleGlow focus:outline-none focus:ring-2 focus:ring-clueRed"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="border border-fogGray p-3 rounded-md shadow-subtleGlow focus:outline-none focus:ring-2 focus:ring-clueRed w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border border-fogGray p-3 rounded-md shadow-subtleGlow focus:outline-none focus:ring-2 focus:ring-clueRed w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Top Companies */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Top Visiting Companies (Last 7 Days)</h2>
        <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-2">
          {topCompanies.map(([company, stats], i) => (
            <li key={i} className="flex justify-between text-lg">
              <span><b>{company}</b></span>
              <span> {stats.count} visits | avg time: {formatSeconds(Math.round(stats.time / stats.count))}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Visit Trends */}
      <section className="bg-parchment border border-detectiveBrown p-6 rounded-lg shadow-subtleGlow mb-10">
        <h2 className="text-2xl font-semibold text-detectiveBrown mb-6 border-b border-clueRed pb-2">Visit Trends by Company (Last 14 Days)</h2>
        <Line
          data={trendData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#4B382A', font: { family: 'Georgia, serif' } },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#B33A3A',
                titleFont: { family: 'Georgia, serif', weight: 'bold' },
                bodyFont: { family: 'Georgia, serif' },
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
                  color: '#4B382A',
                  font: { family: 'Georgia, serif' },
                },
                ticks: {
                  color: '#4B382A',
                  font: { family: 'Georgia, serif' },
                },
                grid: {
                  color: '#A89F91',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Date',
                  color: '#4B382A',
                  font: { family: 'Georgia, serif' },
                },
                ticks: {
                  color: '#4B382A',
                  font: { family: 'Georgia, serif' },
                },
                grid: {
                  color: '#A89F91',
                },
              },
            },
          }}
        />
      </section>

      {/* Most Viewed Pages */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Most Viewed Pages</h2>
        <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-2 text-lg">
          {mostViewedPages.map(([url, count], i) => (
            <li key={i} className="flex justify-between">
              <span><b>{url}</b></span>
              <span> {count} views</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top Locations */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Top Visitor Locations</h2>
        <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-2 text-lg">
          {topLocations.map(([location, count], i) => (
            <li key={i} className="flex justify-between">
              <span><b>{location}</b></span>
              <span> {count} visits</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <InsightCard title="Total Visits" value={totalVisits} />
        <InsightCard title="Avg Time on Site" value={`${avgTimeOnSite} sec`} />
        <InsightCard title="Unique Companies" value={new Set(filtered.map(v => v.company)).size} />
      </div>

      {/* Recent Activity Feed */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Recent Visitor Activity</h2>
        <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-3 text-lg">
          {recentActivity.map((v, i) => (
            <li key={i} className="border-b border-detectiveBrown pb-2 last:border-none">
              <div className="flex justify-between font-semibold">
                <span>{v.company || 'Unknown'} ({v.location || 'Unknown'})</span>
                <span> {new Date(v.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-clueRed"> Visited: {v.url} | {formatSeconds(v.timeOnPage)} on site</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
