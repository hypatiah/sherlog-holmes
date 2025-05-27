import json
import random
from datetime import datetime, timedelta
import faker

fake = faker.Faker()

companies = [
    {"company": "Google LLC", "industry": "Technology", "location": "Mountain View, CA, USA", "ip": "8.8.8.8"},
    {"company": "Microsoft Corporation", "industry": "Software", "location": "Redmond, WA, USA", "ip": "13.107.21.200"},
    {"company": "Amazon Web Services", "industry": "Cloud Computing", "location": "Seattle, WA, USA", "ip": "52.94.76.80"},
    {"company": "Meta Platforms", "industry": "Social Media", "location": "Menlo Park, CA, USA", "ip": "66.220.144.0"},
    {"company": "IBM", "industry": "IT Services", "location": "Armonk, NY, USA", "ip": "129.42.38.1"},
    {"company": "Oracle", "industry": "Enterprise Software", "location": "Austin, TX, USA", "ip": "137.254.16.1"},
    {"company": "Salesforce", "industry": "CRM", "location": "San Francisco, CA, USA", "ip": "96.43.144.1"},
    {"company": "Adobe", "industry": "Design Software", "location": "San Jose, CA, USA", "ip": "192.147.130.1"},
    {"company": "Netflix", "industry": "Media", "location": "Los Gatos, CA, USA", "ip": "52.26.14.0"},
    {"company": "Spotify", "industry": "Streaming", "location": "Stockholm, Sweden", "ip": "104.199.64.1"}
]

urls = [
    "/pricing", "/products/chat", "/products/voice", "/contact", "/about",
    "/support", "/blog/customer-service", "/webinars", "/case-studies",
    "/resources", "/features", "/signup", "/login"
]

user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    "Mozilla/5.0 (Linux; Android 11; Pixel 5)",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0)",
    "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)"
]

web_logs = []

for _ in range(100):
    company = random.choice(companies)
    log = {
        "ip": company["ip"],
        "company": company["company"],
        "industry": company["industry"],
        "location": company["location"],
        "url": random.choice(urls),
        "timestamp": (datetime.utcnow() - timedelta(days=random.randint(0, 30), minutes=random.randint(0, 1440))).isoformat() + "Z",
        "userAgent": random.choice(user_agents),
        "timeOnPage": random.randint(30, 600),
        "pagesViewed": random.randint(1, 10),
        "referrer": fake.uri(),
        "trafficSource": random.choice(["Organic", "Paid", "Referral", "Social", "Email"]),
        "visitCount": random.randint(1, 5)
    }
    web_logs.append(log)

# Save to JSON file
with open("visitorLogs.json", "w") as f:
    json.dump(web_logs, f, indent=2)
