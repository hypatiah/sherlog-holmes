
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
    <div className="bg-white border shadow p-4 rounded text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
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

  const visitTrends = filtered.reduce((acc, v) => {
    const date = new Date(v.timestamp).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const chartData = {
    labels: Object.keys(visitTrends),
    datasets: [
      {
        label: 'Visits per Day',
        data: Object.values(visitTrends),
        borderColor: '#3b82f6',
        fill: false,
      },
    ],
  };

  const companies = [...new Set(visitors.map(v => v.company))];
  const locations = [...new Set(visitors.map(v => v.location))];

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Visitor Insights Dashboard</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search company..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border p-2 rounded" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="border p-2 rounded" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InsightCard title="Total Visits" value={totalVisits} />
        <InsightCard title="Avg Time on Site" value={`${avgTimeOnSite} sec`} />
        <InsightCard title="Unique Companies" value={new Set(filtered.map(v => v.company)).size} />
      </div>

      {/* Trend Chart */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Visit Trends</h2>
        <div className="bg-white p-4 rounded shadow">
          <Line data={chartData} />
        </div>
      </section>

      {/* Table */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Visitor Details</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Company</th>
                <th className="p-2">Industry</th>
                <th className="p-2">Location</th>
                <th className="p-2">Page</th>
                <th className="p-2">Time on Site</th>
                <th className="p-2">Pages Viewed</th>
                <th className="p-2">Referrer</th>
                <th className="p-2">Visited</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((v, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{v.company}</td>
                  <td className="p-2">{v.industry}</td>
                  <td className="p-2">{v.location}</td>
                  <td className="p-2">{v.url}</td>
                  <td className="p-2">{v.timeOnPage} sec</td>
                  <td className="p-2">{v.pagesViewed}</td>
                  <td className="p-2 truncate max-w-[150px]">{v.referrer}</td>
                  <td className="p-2">{new Date(v.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
