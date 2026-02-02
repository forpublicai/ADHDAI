// Fortune 500 Company Data
// Source: Fortune 500 list (simplified for demonstration)

export interface Fortune500Company {
  name: string;
  ticker?: string;
  industry: string;
  sector: string;
  description: string;
  riskProfile: string[]; // Categories of risk this company is exposed to
}

export const FORTUNE_500_COMPANIES: Fortune500Company[] = [
  // Energy & Oil
  { name: "Walmart", ticker: "WMT", industry: "Retail", sector: "Consumer Goods", description: "Multinational retail corporation operating hypermarkets, discount stores, and grocery stores", riskProfile: ["labor", "supply-chain", "environmental", "social"] },
  { name: "Amazon", ticker: "AMZN", industry: "E-commerce & Cloud", sector: "Technology", description: "E-commerce, cloud computing, digital streaming, and AI company", riskProfile: ["labor", "antitrust", "data-privacy", "environmental"] },
  { name: "Apple", ticker: "AAPL", industry: "Consumer Electronics", sector: "Technology", description: "Designer and manufacturer of consumer electronics, software, and services", riskProfile: ["supply-chain", "labor", "environmental", "geopolitical"] },
  { name: "CVS Health", ticker: "CVS", industry: "Healthcare & Pharmacy", sector: "Healthcare", description: "Healthcare company owning CVS Pharmacy and Aetna insurance", riskProfile: ["healthcare", "data-privacy", "regulatory", "opioid"] },
  { name: "UnitedHealth Group", ticker: "UNH", industry: "Health Insurance", sector: "Healthcare", description: "Health insurance and healthcare services company", riskProfile: ["healthcare", "regulatory", "data-privacy", "pricing"] },
  { name: "ExxonMobil", ticker: "XOM", industry: "Oil & Gas", sector: "Energy", description: "Multinational oil and gas corporation", riskProfile: ["environmental", "climate", "regulatory", "geopolitical"] },
  { name: "Berkshire Hathaway", ticker: "BRK.A", industry: "Conglomerate", sector: "Financial", description: "Multinational conglomerate holding company", riskProfile: ["financial", "regulatory", "climate", "insurance"] },
  { name: "Alphabet", ticker: "GOOGL", industry: "Technology", sector: "Technology", description: "Parent company of Google, specializing in internet services and AI", riskProfile: ["antitrust", "data-privacy", "regulatory", "AI-ethics"] },
  { name: "McKesson", ticker: "MCK", industry: "Pharmaceutical Distribution", sector: "Healthcare", description: "Pharmaceutical distribution and healthcare IT company", riskProfile: ["opioid", "regulatory", "healthcare", "supply-chain"] },
  { name: "Chevron", ticker: "CVX", industry: "Oil & Gas", sector: "Energy", description: "Multinational energy corporation", riskProfile: ["environmental", "climate", "regulatory", "geopolitical"] },
  
  // Technology
  { name: "Microsoft", ticker: "MSFT", industry: "Software & Cloud", sector: "Technology", description: "Technology company producing software, cloud services, and hardware", riskProfile: ["antitrust", "cybersecurity", "AI-ethics", "labor"] },
  { name: "Meta Platforms", ticker: "META", industry: "Social Media", sector: "Technology", description: "Social media and virtual reality company (Facebook, Instagram, WhatsApp)", riskProfile: ["data-privacy", "misinformation", "regulatory", "mental-health"] },
  { name: "Tesla", ticker: "TSLA", industry: "Electric Vehicles", sector: "Automotive", description: "Electric vehicle and clean energy company", riskProfile: ["safety", "labor", "supply-chain", "regulatory"] },
  { name: "Intel", ticker: "INTC", industry: "Semiconductors", sector: "Technology", description: "Semiconductor chip manufacturer", riskProfile: ["supply-chain", "geopolitical", "environmental", "competition"] },
  { name: "IBM", ticker: "IBM", industry: "Technology Services", sector: "Technology", description: "Technology and consulting company", riskProfile: ["AI-ethics", "cybersecurity", "labor", "competition"] },
  { name: "Oracle", ticker: "ORCL", industry: "Enterprise Software", sector: "Technology", description: "Enterprise software and cloud computing company", riskProfile: ["data-privacy", "cybersecurity", "antitrust", "labor"] },
  { name: "Salesforce", ticker: "CRM", industry: "Cloud Software", sector: "Technology", description: "Cloud-based CRM software company", riskProfile: ["data-privacy", "cybersecurity", "labor", "competition"] },
  { name: "Nvidia", ticker: "NVDA", industry: "Semiconductors", sector: "Technology", description: "Graphics processing unit and AI chip manufacturer", riskProfile: ["supply-chain", "geopolitical", "AI-ethics", "environmental"] },
  { name: "Cisco", ticker: "CSCO", industry: "Networking", sector: "Technology", description: "Networking hardware and software company", riskProfile: ["cybersecurity", "geopolitical", "supply-chain", "competition"] },
  { name: "Adobe", ticker: "ADBE", industry: "Software", sector: "Technology", description: "Creative and marketing software company", riskProfile: ["AI-ethics", "competition", "data-privacy", "labor"] },
  
  // Financial Services
  { name: "JPMorgan Chase", ticker: "JPM", industry: "Banking", sector: "Financial", description: "Multinational investment bank and financial services company", riskProfile: ["financial", "regulatory", "cybersecurity", "climate"] },
  { name: "Bank of America", ticker: "BAC", industry: "Banking", sector: "Financial", description: "Multinational investment bank and financial services company", riskProfile: ["financial", "regulatory", "cybersecurity", "climate"] },
  { name: "Wells Fargo", ticker: "WFC", industry: "Banking", sector: "Financial", description: "Multinational financial services company", riskProfile: ["fraud", "regulatory", "cybersecurity", "reputation"] },
  { name: "Citigroup", ticker: "C", industry: "Banking", sector: "Financial", description: "Multinational investment bank and financial services corporation", riskProfile: ["financial", "regulatory", "geopolitical", "cybersecurity"] },
  { name: "Goldman Sachs", ticker: "GS", industry: "Investment Banking", sector: "Financial", description: "Multinational investment bank and financial services company", riskProfile: ["financial", "regulatory", "reputation", "climate"] },
  { name: "Morgan Stanley", ticker: "MS", industry: "Investment Banking", sector: "Financial", description: "Multinational investment bank and financial services company", riskProfile: ["financial", "regulatory", "cybersecurity", "climate"] },
  { name: "American Express", ticker: "AXP", industry: "Financial Services", sector: "Financial", description: "Financial services corporation specializing in payment cards", riskProfile: ["cybersecurity", "financial", "regulatory", "competition"] },
  { name: "Visa", ticker: "V", industry: "Payment Processing", sector: "Financial", description: "Multinational financial services corporation facilitating electronic funds transfers", riskProfile: ["cybersecurity", "antitrust", "regulatory", "competition"] },
  { name: "Mastercard", ticker: "MA", industry: "Payment Processing", sector: "Financial", description: "Multinational financial services corporation", riskProfile: ["cybersecurity", "antitrust", "regulatory", "competition"] },
  { name: "BlackRock", ticker: "BLK", industry: "Asset Management", sector: "Financial", description: "Global investment management corporation", riskProfile: ["climate", "regulatory", "reputation", "financial"] },
  
  // Healthcare & Pharma
  { name: "Johnson & Johnson", ticker: "JNJ", industry: "Pharmaceuticals", sector: "Healthcare", description: "Multinational pharmaceutical and consumer goods company", riskProfile: ["product-liability", "regulatory", "opioid", "environmental"] },
  { name: "Pfizer", ticker: "PFE", industry: "Pharmaceuticals", sector: "Healthcare", description: "Multinational pharmaceutical and biotechnology corporation", riskProfile: ["regulatory", "product-liability", "pricing", "supply-chain"] },
  { name: "AbbVie", ticker: "ABBV", industry: "Pharmaceuticals", sector: "Healthcare", description: "Biopharmaceutical company", riskProfile: ["regulatory", "pricing", "competition", "product-liability"] },
  { name: "Merck", ticker: "MRK", industry: "Pharmaceuticals", sector: "Healthcare", description: "Multinational pharmaceutical company", riskProfile: ["regulatory", "pricing", "product-liability", "competition"] },
  { name: "Bristol-Myers Squibb", ticker: "BMY", industry: "Pharmaceuticals", sector: "Healthcare", description: "Pharmaceutical company", riskProfile: ["regulatory", "pricing", "competition", "product-liability"] },
  { name: "Eli Lilly", ticker: "LLY", industry: "Pharmaceuticals", sector: "Healthcare", description: "Pharmaceutical company", riskProfile: ["regulatory", "pricing", "product-liability", "supply-chain"] },
  { name: "Anthem", ticker: "ANTM", industry: "Health Insurance", sector: "Healthcare", description: "Health insurance provider", riskProfile: ["healthcare", "regulatory", "data-privacy", "pricing"] },
  { name: "Cigna", ticker: "CI", industry: "Health Insurance", sector: "Healthcare", description: "Health services organization", riskProfile: ["healthcare", "regulatory", "data-privacy", "pricing"] },
  { name: "Humana", ticker: "HUM", industry: "Health Insurance", sector: "Healthcare", description: "Health insurance company", riskProfile: ["healthcare", "regulatory", "pricing", "fraud"] },
  { name: "Cardinal Health", ticker: "CAH", industry: "Pharmaceutical Distribution", sector: "Healthcare", description: "Healthcare services company", riskProfile: ["opioid", "regulatory", "supply-chain", "healthcare"] },
  
  // Automotive
  { name: "Ford Motor", ticker: "F", industry: "Automotive", sector: "Automotive", description: "Multinational automobile manufacturer", riskProfile: ["safety", "environmental", "labor", "supply-chain"] },
  { name: "General Motors", ticker: "GM", industry: "Automotive", sector: "Automotive", description: "Multinational automobile manufacturer", riskProfile: ["safety", "environmental", "labor", "supply-chain"] },
  { name: "Toyota", ticker: "TM", industry: "Automotive", sector: "Automotive", description: "Japanese multinational automotive manufacturer (US operations)", riskProfile: ["safety", "environmental", "supply-chain", "geopolitical"] },
  
  // Retail & Consumer
  { name: "Costco", ticker: "COST", industry: "Retail", sector: "Consumer Goods", description: "Membership-only big-box retail store", riskProfile: ["labor", "supply-chain", "food-safety", "environmental"] },
  { name: "Target", ticker: "TGT", industry: "Retail", sector: "Consumer Goods", description: "General merchandise retailer", riskProfile: ["labor", "cybersecurity", "supply-chain", "social"] },
  { name: "Home Depot", ticker: "HD", industry: "Home Improvement", sector: "Consumer Goods", description: "Home improvement retailer", riskProfile: ["labor", "supply-chain", "environmental", "safety"] },
  { name: "Lowe's", ticker: "LOW", industry: "Home Improvement", sector: "Consumer Goods", description: "Home improvement and appliance retailer", riskProfile: ["labor", "supply-chain", "environmental", "safety"] },
  { name: "Best Buy", ticker: "BBY", industry: "Electronics Retail", sector: "Consumer Goods", description: "Consumer electronics retailer", riskProfile: ["competition", "labor", "e-waste", "supply-chain"] },
  { name: "Nike", ticker: "NKE", industry: "Apparel", sector: "Consumer Goods", description: "Athletic footwear and apparel company", riskProfile: ["labor", "supply-chain", "environmental", "social"] },
  { name: "Starbucks", ticker: "SBUX", industry: "Food & Beverage", sector: "Consumer Goods", description: "Coffeehouse chain", riskProfile: ["labor", "supply-chain", "environmental", "social"] },
  { name: "McDonald's", ticker: "MCD", industry: "Fast Food", sector: "Consumer Goods", description: "Fast food restaurant chain", riskProfile: ["health", "labor", "environmental", "food-safety"] },
  { name: "Coca-Cola", ticker: "KO", industry: "Beverages", sector: "Consumer Goods", description: "Beverage corporation", riskProfile: ["health", "environmental", "water", "plastic"] },
  { name: "PepsiCo", ticker: "PEP", industry: "Food & Beverage", sector: "Consumer Goods", description: "Food, snack, and beverage corporation", riskProfile: ["health", "environmental", "water", "plastic"] },
  { name: "Procter & Gamble", ticker: "PG", industry: "Consumer Goods", sector: "Consumer Goods", description: "Consumer goods corporation", riskProfile: ["environmental", "supply-chain", "product-safety", "labor"] },
  { name: "Mondelez", ticker: "MDLZ", industry: "Food", sector: "Consumer Goods", description: "Multinational confectionery, food, and beverage company", riskProfile: ["health", "environmental", "supply-chain", "labor"] },
  { name: "Kraft Heinz", ticker: "KHC", industry: "Food", sector: "Consumer Goods", description: "Food company", riskProfile: ["health", "environmental", "supply-chain", "food-safety"] },
  { name: "Tyson Foods", ticker: "TSN", industry: "Food Processing", sector: "Consumer Goods", description: "Multinational food corporation", riskProfile: ["environmental", "labor", "animal-welfare", "food-safety"] },
  
  // Energy & Utilities
  { name: "BP", ticker: "BP", industry: "Oil & Gas", sector: "Energy", description: "British multinational oil and gas company", riskProfile: ["environmental", "climate", "safety", "regulatory"] },
  { name: "Shell", ticker: "SHEL", industry: "Oil & Gas", sector: "Energy", description: "British-Dutch multinational oil and gas company", riskProfile: ["environmental", "climate", "regulatory", "geopolitical"] },
  { name: "ConocoPhillips", ticker: "COP", industry: "Oil & Gas", sector: "Energy", description: "Multinational energy corporation", riskProfile: ["environmental", "climate", "regulatory", "safety"] },
  { name: "Phillips 66", ticker: "PSX", industry: "Oil Refining", sector: "Energy", description: "Energy manufacturing and logistics company", riskProfile: ["environmental", "safety", "regulatory", "climate"] },
  { name: "Valero Energy", ticker: "VLO", industry: "Oil Refining", sector: "Energy", description: "International manufacturer and marketer of transportation fuels", riskProfile: ["environmental", "safety", "regulatory", "climate"] },
  { name: "Marathon Petroleum", ticker: "MPC", industry: "Oil Refining", sector: "Energy", description: "Petroleum refining, marketing, and transportation company", riskProfile: ["environmental", "safety", "regulatory", "climate"] },
  { name: "Duke Energy", ticker: "DUK", industry: "Utilities", sector: "Energy", description: "Electric power and natural gas holding company", riskProfile: ["environmental", "regulatory", "infrastructure", "climate"] },
  { name: "Southern Company", ticker: "SO", industry: "Utilities", sector: "Energy", description: "Gas and electric utility holding company", riskProfile: ["environmental", "regulatory", "infrastructure", "climate"] },
  { name: "Dominion Energy", ticker: "D", industry: "Utilities", sector: "Energy", description: "Power and energy company", riskProfile: ["environmental", "regulatory", "infrastructure", "climate"] },
  { name: "NextEra Energy", ticker: "NEE", industry: "Utilities", sector: "Energy", description: "Electric utility company", riskProfile: ["environmental", "regulatory", "infrastructure", "climate"] },
  
  // Aerospace & Defense
  { name: "Boeing", ticker: "BA", industry: "Aerospace", sector: "Industrials", description: "Aerospace company and defense contractor", riskProfile: ["safety", "regulatory", "supply-chain", "geopolitical"] },
  { name: "Lockheed Martin", ticker: "LMT", industry: "Defense", sector: "Industrials", description: "Aerospace, defense, and security company", riskProfile: ["geopolitical", "regulatory", "ethics", "cybersecurity"] },
  { name: "Raytheon Technologies", ticker: "RTX", industry: "Defense", sector: "Industrials", description: "Aerospace and defense conglomerate", riskProfile: ["geopolitical", "regulatory", "ethics", "cybersecurity"] },
  { name: "General Dynamics", ticker: "GD", industry: "Defense", sector: "Industrials", description: "Aerospace and defense company", riskProfile: ["geopolitical", "regulatory", "ethics", "safety"] },
  { name: "Northrop Grumman", ticker: "NOC", industry: "Defense", sector: "Industrials", description: "Aerospace and defense technology company", riskProfile: ["geopolitical", "regulatory", "ethics", "cybersecurity"] },
  
  // Telecommunications
  { name: "AT&T", ticker: "T", industry: "Telecommunications", sector: "Telecommunications", description: "Multinational telecommunications conglomerate", riskProfile: ["data-privacy", "cybersecurity", "regulatory", "infrastructure"] },
  { name: "Verizon", ticker: "VZ", industry: "Telecommunications", sector: "Telecommunications", description: "Multinational telecommunications conglomerate", riskProfile: ["data-privacy", "cybersecurity", "regulatory", "infrastructure"] },
  { name: "T-Mobile", ticker: "TMUS", industry: "Telecommunications", sector: "Telecommunications", description: "Wireless network operator", riskProfile: ["data-privacy", "cybersecurity", "regulatory", "competition"] },
  { name: "Comcast", ticker: "CMCSA", industry: "Telecommunications", sector: "Telecommunications", description: "Telecommunications conglomerate", riskProfile: ["data-privacy", "antitrust", "regulatory", "competition"] },
  { name: "Charter Communications", ticker: "CHTR", industry: "Telecommunications", sector: "Telecommunications", description: "Telecommunications and mass media company", riskProfile: ["data-privacy", "regulatory", "competition", "infrastructure"] },
  
  // Transportation & Logistics
  { name: "UPS", ticker: "UPS", industry: "Logistics", sector: "Transportation", description: "Package delivery and supply chain management company", riskProfile: ["labor", "environmental", "safety", "supply-chain"] },
  { name: "FedEx", ticker: "FDX", industry: "Logistics", sector: "Transportation", description: "Multinational delivery services company", riskProfile: ["labor", "environmental", "safety", "supply-chain"] },
  { name: "Delta Air Lines", ticker: "DAL", industry: "Airlines", sector: "Transportation", description: "Major American airline", riskProfile: ["safety", "environmental", "labor", "pandemic"] },
  { name: "American Airlines", ticker: "AAL", industry: "Airlines", sector: "Transportation", description: "Major American airline", riskProfile: ["safety", "environmental", "labor", "pandemic"] },
  { name: "United Airlines", ticker: "UAL", industry: "Airlines", sector: "Transportation", description: "Major American airline", riskProfile: ["safety", "environmental", "labor", "pandemic"] },
  { name: "Southwest Airlines", ticker: "LUV", industry: "Airlines", sector: "Transportation", description: "Major American airline", riskProfile: ["safety", "environmental", "labor", "operational"] },
  { name: "Union Pacific", ticker: "UNP", industry: "Railroads", sector: "Transportation", description: "Freight railroad company", riskProfile: ["safety", "environmental", "labor", "infrastructure"] },
  { name: "CSX", ticker: "CSX", industry: "Railroads", sector: "Transportation", description: "Transportation company providing rail-based services", riskProfile: ["safety", "environmental", "labor", "infrastructure"] },
  { name: "Norfolk Southern", ticker: "NSC", industry: "Railroads", sector: "Transportation", description: "Rail transportation company", riskProfile: ["safety", "environmental", "labor", "infrastructure"] },
  
  // Insurance
  { name: "State Farm", industry: "Insurance", sector: "Financial", description: "Insurance and financial services company", riskProfile: ["climate", "regulatory", "fraud", "financial"] },
  { name: "Allstate", ticker: "ALL", industry: "Insurance", sector: "Financial", description: "Insurance company", riskProfile: ["climate", "regulatory", "fraud", "pricing"] },
  { name: "Progressive", ticker: "PGR", industry: "Insurance", sector: "Financial", description: "Insurance company", riskProfile: ["climate", "regulatory", "data-privacy", "pricing"] },
  { name: "Liberty Mutual", industry: "Insurance", sector: "Financial", description: "Diversified global insurer", riskProfile: ["climate", "regulatory", "fraud", "financial"] },
  { name: "Travelers", ticker: "TRV", industry: "Insurance", sector: "Financial", description: "Insurance company", riskProfile: ["climate", "regulatory", "cybersecurity", "financial"] },
  { name: "MetLife", ticker: "MET", industry: "Insurance", sector: "Financial", description: "Insurance and employee benefits company", riskProfile: ["regulatory", "financial", "data-privacy", "fraud"] },
  { name: "Prudential Financial", ticker: "PRU", industry: "Insurance", sector: "Financial", description: "Financial services company", riskProfile: ["regulatory", "financial", "data-privacy", "climate"] },
  { name: "AIG", ticker: "AIG", industry: "Insurance", sector: "Financial", description: "Multinational finance and insurance corporation", riskProfile: ["climate", "regulatory", "financial", "reputation"] },
  
  // Media & Entertainment
  { name: "Walt Disney", ticker: "DIS", industry: "Entertainment", sector: "Media", description: "Multinational entertainment and media conglomerate", riskProfile: ["reputation", "labor", "regulatory", "social"] },
  { name: "Netflix", ticker: "NFLX", industry: "Streaming", sector: "Media", description: "Streaming entertainment service", riskProfile: ["competition", "content", "data-privacy", "labor"] },
  { name: "Warner Bros. Discovery", ticker: "WBD", industry: "Entertainment", sector: "Media", description: "Multinational mass media and entertainment conglomerate", riskProfile: ["competition", "content", "labor", "financial"] },
  { name: "Paramount Global", ticker: "PARA", industry: "Entertainment", sector: "Media", description: "Media and entertainment conglomerate", riskProfile: ["competition", "content", "labor", "financial"] },
  { name: "Fox Corporation", ticker: "FOXA", industry: "Media", sector: "Media", description: "Mass media company", riskProfile: ["misinformation", "regulatory", "reputation", "legal"] },
  { name: "News Corp", ticker: "NWSA", industry: "Media", sector: "Media", description: "Mass media and publishing company", riskProfile: ["misinformation", "regulatory", "reputation", "legal"] },
  
  // Hospitality & Travel
  { name: "Marriott International", ticker: "MAR", industry: "Hospitality", sector: "Consumer Services", description: "Hospitality company", riskProfile: ["cybersecurity", "labor", "pandemic", "environmental"] },
  { name: "Hilton Worldwide", ticker: "HLT", industry: "Hospitality", sector: "Consumer Services", description: "Multinational hospitality company", riskProfile: ["cybersecurity", "labor", "pandemic", "environmental"] },
  { name: "Booking Holdings", ticker: "BKNG", industry: "Travel", sector: "Consumer Services", description: "Travel fare aggregator and metasearch engine", riskProfile: ["data-privacy", "competition", "regulatory", "pandemic"] },
  { name: "Expedia", ticker: "EXPE", industry: "Travel", sector: "Consumer Services", description: "Travel technology company", riskProfile: ["data-privacy", "competition", "regulatory", "pandemic"] },
  { name: "Airbnb", ticker: "ABNB", industry: "Travel", sector: "Consumer Services", description: "Online marketplace for lodging", riskProfile: ["regulatory", "safety", "labor", "housing"] },
  
  // Mining & Materials
  { name: "Freeport-McMoRan", ticker: "FCX", industry: "Mining", sector: "Materials", description: "Mining company", riskProfile: ["environmental", "safety", "labor", "geopolitical"] },
  { name: "Newmont", ticker: "NEM", industry: "Mining", sector: "Materials", description: "Gold mining company", riskProfile: ["environmental", "safety", "labor", "geopolitical"] },
  { name: "Nucor", ticker: "NUE", industry: "Steel", sector: "Materials", description: "Steel and steel products manufacturer", riskProfile: ["environmental", "safety", "labor", "competition"] },
  { name: "Dow", ticker: "DOW", industry: "Chemicals", sector: "Materials", description: "Materials science company", riskProfile: ["environmental", "safety", "regulatory", "climate"] },
  { name: "DuPont", ticker: "DD", industry: "Chemicals", sector: "Materials", description: "Chemical company", riskProfile: ["environmental", "product-liability", "regulatory", "safety"] },
  { name: "3M", ticker: "MMM", industry: "Conglomerate", sector: "Industrials", description: "Multinational conglomerate", riskProfile: ["environmental", "product-liability", "regulatory", "safety"] },
  
  // Agriculture & Food Production
  { name: "Archer-Daniels-Midland", ticker: "ADM", industry: "Agriculture", sector: "Consumer Goods", description: "Food processing and commodities trading corporation", riskProfile: ["environmental", "supply-chain", "food-safety", "climate"] },
  { name: "Cargill", industry: "Agriculture", sector: "Consumer Goods", description: "Food corporation", riskProfile: ["environmental", "supply-chain", "animal-welfare", "climate"] },
  { name: "Deere & Company", ticker: "DE", industry: "Agricultural Machinery", sector: "Industrials", description: "Agricultural machinery manufacturer", riskProfile: ["environmental", "labor", "supply-chain", "right-to-repair"] },
  { name: "Bunge", ticker: "BG", industry: "Agriculture", sector: "Consumer Goods", description: "Agribusiness and food company", riskProfile: ["environmental", "supply-chain", "climate", "deforestation"] },
  
  // Real Estate
  { name: "CBRE Group", ticker: "CBRE", industry: "Real Estate", sector: "Real Estate", description: "Commercial real estate services and investment firm", riskProfile: ["financial", "climate", "regulatory", "economic"] },
  { name: "Prologis", ticker: "PLD", industry: "Real Estate", sector: "Real Estate", description: "Real estate investment trust", riskProfile: ["climate", "regulatory", "economic", "environmental"] },
  { name: "American Tower", ticker: "AMT", industry: "Real Estate", sector: "Real Estate", description: "Real estate investment trust", riskProfile: ["regulatory", "environmental", "infrastructure", "competition"] },
  
  // Construction & Engineering
  { name: "Caterpillar", ticker: "CAT", industry: "Construction Equipment", sector: "Industrials", description: "Construction and mining equipment manufacturer", riskProfile: ["environmental", "safety", "labor", "geopolitical"] },
  { name: "Fluor", ticker: "FLR", industry: "Engineering", sector: "Industrials", description: "Engineering and construction firm", riskProfile: ["safety", "environmental", "regulatory", "financial"] },
  { name: "Jacobs Engineering", ticker: "J", industry: "Engineering", sector: "Industrials", description: "Technical professional services firm", riskProfile: ["safety", "environmental", "regulatory", "cybersecurity"] },
  
  // Gaming & Casinos
  { name: "MGM Resorts", ticker: "MGM", industry: "Gaming", sector: "Consumer Services", description: "Hospitality and entertainment company", riskProfile: ["cybersecurity", "regulatory", "addiction", "pandemic"] },
  { name: "Caesars Entertainment", ticker: "CZR", industry: "Gaming", sector: "Consumer Services", description: "Gaming and hospitality company", riskProfile: ["cybersecurity", "regulatory", "addiction", "financial"] },
  { name: "Las Vegas Sands", ticker: "LVS", industry: "Gaming", sector: "Consumer Services", description: "Casino and resort company", riskProfile: ["geopolitical", "regulatory", "addiction", "pandemic"] },
  
  // Tobacco
  { name: "Philip Morris International", ticker: "PM", industry: "Tobacco", sector: "Consumer Goods", description: "Tobacco company", riskProfile: ["health", "regulatory", "legal", "reputation"] },
  { name: "Altria Group", ticker: "MO", industry: "Tobacco", sector: "Consumer Goods", description: "Tobacco and wine company", riskProfile: ["health", "regulatory", "legal", "reputation"] },
  
  // Alcohol
  { name: "Anheuser-Busch InBev", ticker: "BUD", industry: "Beverages", sector: "Consumer Goods", description: "Multinational drink and brewing company", riskProfile: ["health", "regulatory", "environmental", "social"] },
  { name: "Diageo", ticker: "DEO", industry: "Beverages", sector: "Consumer Goods", description: "Alcoholic beverages company", riskProfile: ["health", "regulatory", "environmental", "social"] },
  { name: "Constellation Brands", ticker: "STZ", industry: "Beverages", sector: "Consumer Goods", description: "Alcoholic beverages company", riskProfile: ["health", "regulatory", "water", "social"] },
  
  // Social Media & Tech Platforms
  { name: "Twitter/X", industry: "Social Media", sector: "Technology", description: "Social media platform", riskProfile: ["misinformation", "data-privacy", "regulatory", "moderation"] },
  { name: "Snap", ticker: "SNAP", industry: "Social Media", sector: "Technology", description: "Camera and social media company", riskProfile: ["mental-health", "data-privacy", "competition", "regulatory"] },
  { name: "Pinterest", ticker: "PINS", industry: "Social Media", sector: "Technology", description: "Image sharing and social media service", riskProfile: ["data-privacy", "misinformation", "competition", "mental-health"] },
  { name: "Uber", ticker: "UBER", industry: "Ride-sharing", sector: "Technology", description: "Ride-sharing and food delivery company", riskProfile: ["labor", "safety", "regulatory", "competition"] },
  { name: "Lyft", ticker: "LYFT", industry: "Ride-sharing", sector: "Technology", description: "Ride-sharing company", riskProfile: ["labor", "safety", "regulatory", "competition"] },
  { name: "DoorDash", ticker: "DASH", industry: "Food Delivery", sector: "Technology", description: "Food delivery platform", riskProfile: ["labor", "safety", "regulatory", "competition"] },
  
  // Cryptocurrency & Fintech
  { name: "Coinbase", ticker: "COIN", industry: "Cryptocurrency", sector: "Financial", description: "Cryptocurrency exchange platform", riskProfile: ["regulatory", "cybersecurity", "financial", "fraud"] },
  { name: "Block (Square)", ticker: "SQ", industry: "Fintech", sector: "Financial", description: "Financial services and digital payments company", riskProfile: ["regulatory", "cybersecurity", "fraud", "competition"] },
  { name: "PayPal", ticker: "PYPL", industry: "Fintech", sector: "Financial", description: "Online payments system", riskProfile: ["cybersecurity", "regulatory", "fraud", "competition"] },
  { name: "Robinhood", ticker: "HOOD", industry: "Fintech", sector: "Financial", description: "Financial services company", riskProfile: ["regulatory", "gamification", "cybersecurity", "fraud"] },
  
  // E-commerce
  { name: "eBay", ticker: "EBAY", industry: "E-commerce", sector: "Technology", description: "E-commerce marketplace", riskProfile: ["fraud", "data-privacy", "competition", "regulatory"] },
  { name: "Etsy", ticker: "ETSY", industry: "E-commerce", sector: "Technology", description: "E-commerce marketplace for handmade goods", riskProfile: ["labor", "fraud", "competition", "data-privacy"] },
  { name: "Shopify", ticker: "SHOP", industry: "E-commerce", sector: "Technology", description: "E-commerce platform", riskProfile: ["data-privacy", "competition", "fraud", "regulatory"] },
  
  // Biotech
  { name: "Moderna", ticker: "MRNA", industry: "Biotechnology", sector: "Healthcare", description: "Biotechnology company focused on mRNA", riskProfile: ["regulatory", "product-liability", "competition", "misinformation"] },
  { name: "Gilead Sciences", ticker: "GILD", industry: "Biotechnology", sector: "Healthcare", description: "Biopharmaceutical company", riskProfile: ["pricing", "regulatory", "competition", "product-liability"] },
  { name: "Amgen", ticker: "AMGN", industry: "Biotechnology", sector: "Healthcare", description: "Multinational biopharmaceutical company", riskProfile: ["pricing", "regulatory", "competition", "product-liability"] },
  { name: "Regeneron", ticker: "REGN", industry: "Biotechnology", sector: "Healthcare", description: "Biotechnology company", riskProfile: ["pricing", "regulatory", "competition", "product-liability"] },
  { name: "Biogen", ticker: "BIIB", industry: "Biotechnology", sector: "Healthcare", description: "Multinational biotechnology company", riskProfile: ["regulatory", "product-liability", "pricing", "competition"] },
];

// Helper function to search companies
export function searchCompanies(query: string): Fortune500Company[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  return FORTUNE_500_COMPANIES.filter(company => {
    const nameMatch = company.name.toLowerCase().includes(normalizedQuery);
    const tickerMatch = company.ticker?.toLowerCase().includes(normalizedQuery);
    const industryMatch = company.industry.toLowerCase().includes(normalizedQuery);
    return nameMatch || tickerMatch || industryMatch;
  }).slice(0, 10); // Limit to 10 results
}

// Get company by exact name
export function getCompanyByName(name: string): Fortune500Company | undefined {
  return FORTUNE_500_COMPANIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}

// Get all unique industries
export function getIndustries(): string[] {
  const industries = new Set(FORTUNE_500_COMPANIES.map(c => c.industry));
  return Array.from(industries).sort();
}

// Get all unique sectors
export function getSectors(): string[] {
  const sectors = new Set(FORTUNE_500_COMPANIES.map(c => c.sector));
  return Array.from(sectors).sort();
}
