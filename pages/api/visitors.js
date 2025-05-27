// import visitorLogs from '../../data/visitorLogs.json';
// import axios from 'axios';

// export default async function handler(req, res) {
//   try {
//     // For demo, enrich each visitor with Geo data and dummy company info
//     const enrichedVisitors = await Promise.all(visitorLogs.map(async (visitor) => {
//       // Call IP geolocation API (use free service or mock)
//       const geoResp = await axios.get(`https://ipinfo.io/${visitor.ip}/json?token=YOUR_TOKEN`);
//       const geoData = geoResp.data;

//       // Mock company lookup (replace with real API e.g., Clearbit Reveal)
//       const companyName = visitor.ip.startsWith('8.') ? 'Google LLC' : 'Unknown Company';

//       return {
//         ...visitor,
//         location: geoData.city + ', ' + geoData.region + ', ' + geoData.country,
//         company: companyName,
//       };
//     }));

//     res.status(200).json({ visitors: enrichedVisitors });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to process visitor logs' });
//   }
// }

// **WORKING **
// import IpInfo from 'ipinfo';
// import visitorLogs from '../../data/visitorLogs.json';


// const client = new IpInfo(process.env.IPINFO_TOKEN); // secure usage

// export default async function handler(req, res) {
//   const visitorLogs = visitorLogs // load data from visitorLogs.json

//   const enriched = await Promise.all(visitorLogs.map(async visitor => {
//     try {
//       const info = await client.lookupIP(visitor.ip);
//       return {
//         ...visitor,
//         org: info.org,
//         city: info.city,
//         region: info.region
//       };
//     } catch (err) {
//       return visitor; // fallback if enrichment fails
//     }
//   }));

//   res.status(200).json(enriched);
// }


// import visitorLogs from '../../data/visitorLogs.json';

// export default async function handler(req, res) {
//   const { ip, url } = req.query;

//   let filtered = visitorLogs;

//   if (ip) {
//     filtered = filtered.filter(visitor => visitor.ip.includes(ip));
//   }

//   if (url) {
//     filtered = filtered.filter(visitor => visitor.url.includes(url));
//   }

//   // Return full list if no query params are provided
//   res.status(200).json(filtered);
// }





// import visitorLogs from '../../data/visitorLogs.json';
// import IpInfo from 'ipinfo';

// // Load IPINFO token from environment variables
// const ipinfo = new IpInfo(process.env.IPINFO_TOKEN);

// export default async function handler(req, res) {
//   const { ip, url } = req.query;

//   // Filter the raw visitor logs (by IP or URL if query params exist)
//   let filtered = visitorLogs;

//   if (ip) {
//     filtered = filtered.filter(visitor => visitor.ip.includes(ip));
//   }

//   if (url) {
//     filtered = filtered.filter(visitor => visitor.url.includes(url));
//   }

//   // Enrich each visitor with data from ipinfo
//   const enrichedVisitors = await Promise.all(
//     filtered.map(async (visitor) => {
//       try {
//         const info = await ipinfo.lookupIP(visitor.ip);
//         return {
//           ...visitor,
//           org: info.org || null,
//           city: info.city || null,
//           region: info.region || null,
//           country: info.country || null,
//         };
//       } catch (err) {
//         // If enrichment fails, return original visitor without extras
//         return {
//           ...visitor,
//           org: null,
//           city: null,
//           region: null,
//           country: null,
//         };
//       }
//     })
//   );
//   console.log(enrichedVisitors)
//   res.status(200).json(enrichedVisitors);
// }



// pages/api/visitors.js

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'visitorLogs.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const visitors = JSON.parse(fileContents);

    res.status(200).json(visitors);
  } catch (error) {
    console.error('Error reading visitor logs:', error);
    res.status(500).json({ error: 'Failed to load visitor data' });
  }
}
