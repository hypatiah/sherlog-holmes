'use client';
import { useState } from 'react';

export default function VisitorsPage() {
  const [ip, setIp] = useState('');
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    const res = await fetch(`/api/visitors?ip=${ip}&url=${url}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Visitor Search</h1>
      <div className="flex gap-2 mb-4">
        <input value={ip} onChange={e => setIp(e.target.value)} placeholder="Search by IP" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Search by URL" />
        <button onClick={search}>Search</button>
      </div>
      <table>
        <thead>
          <tr><th>IP</th><th>URL</th><th>Time</th></tr>
        </thead>
        <tbody>
          {results.map((v, i) => (
            <tr key={i}>
              <td>{v.ip}</td>
              <td>{v.url}</td>
              <td>{new Date(v.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
