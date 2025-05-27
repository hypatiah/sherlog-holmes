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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchVisitors = async () => {
      setLoading(true);
      const res = await fetch('/api/visitors');
      const data = await res.json();
      setVisitors(data);
      setFiltered(data);
      setLoading(false);
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

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

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

  const companyColors = ['#4B382A', '#B33A3A', '#7D7D7D', '#6554C0', '#0052CC'];

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
    })),
  };

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
    <main className="bg-parchment min-h-screen p-6 sm:p-8 max-w-7xl mx-auto font-serifMystery text-detectiveBrown">
      <header className="mb-10">
        <h1 className="text-5xl font-extrabold mb-2 border-b-4 border-clueRed pb-2">SherLog Holmes</h1>
        <p className="text-lg text-fogGray">Solving the mysteries of your website visitors, one case at a time.</p>
      </header>

      {/* Sticky Filters Panel */}
      <div className="sticky top-0 z-10 bg-parchment py-4 border-b border-detectiveBrown mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Search company..."
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
              className="border p-3 rounded-md shadow-subtleGlow w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border p-3 rounded-md shadow-subtleGlow w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <InsightCard title="Total Visits" value={totalVisits} />
        <InsightCard title="Avg Time on Site" value={formatSeconds(avgTimeOnSite)} />
        <InsightCard title="Unique Companies" value={new Set(filtered.map(v => v.company)).size} />
      </div>

      {/* Top Companies */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Top Visiting Companies (Last 7 Days)</h2>
        <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-2 text-lg">
          {topCompanies.map(([company, stats], i) => (
            <li key={i} className="flex justify-between hover:bg-fogGray/20 p-2 rounded transition">
              <span className="font-bold cursor-pointer text-clueRed hover:underline">{company}</span>
              <span> {stats.count} visits | avg time: {formatSeconds(Math.round(stats.time / stats.count))}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Visit Trends */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Visit Trends by Company (Last 14 Days)</h2>
        <div className="bg-parchment border border-detectiveBrown p-4 rounded-lg shadow-subtleGlow">
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
                  ticks: { color: '#4B382A' },
                  grid: { color: '#A89F91' },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date',
                    color: '#4B382A',
                    font: { family: 'Georgia, serif' },
                  },
                  ticks: { color: '#4B382A' },
                  grid: { color: '#A89F91' },
                },
              },
            }}
          />
        </div>
      </section>

      {/* Most Viewed Pages */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Most Viewed Pages</h2>
        <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-2 text-lg">
          {mostViewedPages.map(([url, count], i) => (
            <li key={i} className="flex justify-between">
              <span className="truncate"><b>{url}</b></span>
              <span> {count} views</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top Locations */}
      <section className="mb-12">
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

      {/* Recent Activity Feed */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4 border-b border-clueRed pb-1">Recent Visitor Activity</h2>
        {loading ? (
          <p className="text-center text-lg text-fogGray">Loading activity...</p>
        ) : (
          <ul className="bg-parchment border border-detectiveBrown rounded-lg shadow-subtleGlow p-4 space-y-3 text-lg">
            {recentActivity.map((v, i) => (
              <li key={i} className="border-b border-detectiveBrown pb-2 last:border-none">
                <div className="flex justify-between font-semibold">
                  <span><b>{v.company || 'Unknown'} ({v.location || 'Unknown'})</b></span>
                  <span> {new Date(v.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-clueRed">
                  Visited: <span className="font-mono">{v.url}</span> | {formatSeconds(v.timeOnPage)} on site
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
