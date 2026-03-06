import { headers } from "next/headers";
import { getSiteConfig } from "@/lib/site-config";

// Server Component - reads Host header directly
export async function FooterDisclaimerServer() {
  const headersList = await headers();
  const host = headersList.get("host") || "flyvietnam.help";
  const hostname = host.split(":")[0].replace(/^www\./, "").toLowerCase();

  const siteConfig = getSiteConfig(hostname);
  const siteName = siteConfig.content.siteName;

  // FlyVietnam.Help specific disclaimer - no references to other domains
  const disclaimerText = `${siteName} is a private travel consultancy and concierge service operated by BestPrice Travel (License No: 01-1794/2022/SDL-GPLHND). We are not affiliated with the Vietnamese Government or the Immigration Department. We provide B2B and B2C travel planning, airport fast-track, and entry document guidance. Travelers may choose to arrange their own entry requirements directly through official Vietnam government portals.`;

  return (
    <div className="mb-4">
      <h3 className="text-amber-400 font-semibold mb-1.5 text-sm">Important Disclaimer</h3>
      <p className="text-xs text-gray-400">
        {disclaimerText}
      </p>
    </div>
  );
}
