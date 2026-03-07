"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/ui/language-selector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/ui/footer";
import { Logo } from "@/components/ui/logo";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { useSite } from "@/contexts/SiteContext";

export default function TermsPage() {
  const { siteName, isChinaSite, domain } = useSite();

  // Get site name for text references
  const siteDisplayName = isChinaSite ? "越签.com" : "FlyVietnam.Help";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" siteName={isChinaSite ? "越签.com" : undefined} />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Third-Party Disclaimer Banner */}
      <DisclaimerBanner />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isChinaSite ? "条款和条件" : "Terms and Conditions"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {siteDisplayName} | {isChinaSite ? "最后更新：2026年3月8日" : "Last updated: March 8, 2026"}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {isChinaSite
              ? "访问、浏览或使用我们的网站和/或完成预订，即表示您已阅读、理解并同意这些条款。"
              : "By accessing, browsing, or using our website and/or completing a reservation, you acknowledge that you have read, understood, and agreed to these Terms."}
          </p>

          {/* Table of Contents */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "目录" : "Contents"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
              <li>{isChinaSite ? "定义" : "Definitions"}</li>
              <li>{isChinaSite ? "协议与接受" : "Agreement & Acceptance"}</li>
              <li>{isChinaSite ? "我们的服务" : "Our Services"}</li>
              <li>{isChinaSite ? "旅游预订条款" : "Tour Booking Terms"}</li>
              <li>{isChinaSite ? "机场快速通道服务条款" : "Airport Fast Track Service Terms"}</li>
              <li>{isChinaSite ? "付款条款" : "Payment Terms"}</li>
              <li>{isChinaSite ? "取消政策" : "Cancellation Policies"}</li>
              <li>{isChinaSite ? "责任" : "Liability"}</li>
              <li>{isChinaSite ? "儿童价格" : "Children Rates"}</li>
              <li>{isChinaSite ? "价格保证" : "Price Guarantee"}</li>
              <li>{isChinaSite ? "质量与退款保证" : "Quality & Money-Back Guarantees"}</li>
              <li>{isChinaSite ? "一般条款" : "General"}</li>
              <li>{isChinaSite ? "联系信息" : "Contact Information"}</li>
            </ul>
          </div>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "1. 定义" : "1. Definitions"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>{isChinaSite ? "「服务提供商」" : '"Provider"'}</strong> - {isChinaSite ? `${siteDisplayName}，由百思价旅行社运营（许可证号：01-1794/2022/SDL-GPLHND）` : `${siteDisplayName}, operated by BestPrice Travel (License No: 01-1794/2022/SDL-GPLHND)`}</li>
              <li><strong>{isChinaSite ? "「客户」" : '"Client"'}</strong> - {isChinaSite ? "进行预订并支付款项的个人或公司" : "Individual or company making a booking and conducting payment"}</li>
              <li><strong>{isChinaSite ? "「服务」" : '"Services"'}</strong> - {isChinaSite ? "越南旅游、机场快速通道、礼宾服务及旅行协助" : "Vietnam Tours, Airport Fast Track, Concierge Services, and Travel Assistance"}</li>
            </ul>
          </section>

          {/* Agreement & Acceptance */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "2. 协议与接受" : "2. Agreement & Acceptance"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? `${siteDisplayName} 由百思价旅行社运营，是一家持牌旅行社和旅游礼宾服务公司。访问、浏览或使用我们的网站和/或完成预订，即表示您已阅读、理解并同意这些条款。`
                : `${siteDisplayName} is operated by BestPrice Travel, a licensed tour operator and travel concierge service company. By accessing, browsing, or using our website and/or completing a reservation, you acknowledge that you have read, understood, and agreed to these Terms.`}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>{isChinaSite ? "您同意不将网站用于非法目的，并将遵守所有适用的法律法规。" : "You agree that you shall not use the Website for illegal purposes, and will respect all applicable laws and regulations."}</li>
              <li>{isChinaSite ? "您同意对因违反本协议中规定的条款和条件而产生的任何索赔、费用、责任、损失、成本（包括法律费用）承担全部责任。" : "You agree to be fully responsible for any claim, expense, liability, losses, costs including legal fees incurred by us arising from any infringement of the terms and conditions set out in this agreement."}</li>
            </ul>
          </section>

          {/* Our Services */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "3. 我们的服务" : "3. Our Services"}
            </h2>

            {/* Vietnam Tours */}
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200 mb-3">
                {isChinaSite ? "A. 越南旅游和旅行套餐" : "A. Vietnam Tours & Travel Packages"}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>{isChinaSite ? "一日游、多日游、下龙湾游船、湄公河三角洲游" : "Day trips, multi-day tours, Halong Bay cruises, Mekong Delta tours"}</li>
                <li>{isChinaSite ? "定制行程规划" : "Custom itinerary planning"}</li>
                <li>{isChinaSite ? "英语导游、交通、指定餐食" : "English-speaking guides, transportation, meals as specified"}</li>
                <li>{isChinaSite ? "酒店住宿安排" : "Hotel accommodation arrangements"}</li>
              </ul>
            </div>

            {/* Airport Fast Track */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">
                {isChinaSite ? "B. 机场快速通道和VIP服务" : "B. Airport Fast Track & VIP Services"}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>{isChinaSite ? "VIP移民快速通道（免排队）" : "VIP immigration fast track (skip queues)"}</li>
                <li>{isChinaSite ? "迎宾服务" : "Meet & greet services"}</li>
                <li>{isChinaSite ? "私人机场接送" : "Private airport transfers"}</li>
                <li>{isChinaSite ? "贵宾休息室安排" : "Lounge access arrangements"}</li>
              </ul>
            </div>

            {/* Travel Concierge */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-3">
                {isChinaSite ? "C. 旅行礼宾服务" : "C. Travel Concierge Services"}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>{isChinaSite ? "酒店预订" : "Hotel bookings"}</li>
                <li>{isChinaSite ? "餐厅预订" : "Restaurant reservations"}</li>
                <li>{isChinaSite ? "活动安排" : "Activity arrangements"}</li>
                <li>{isChinaSite ? "24/7全天候旅行支持" : "24/7 travel support"}</li>
              </ul>
            </div>
          </section>

          {/* Tour Booking Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "4. 旅游预订条款" : "4. Tour Booking Terms"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>{isChinaSite ? "预订在支付定金后确认" : "Reservations confirmed upon deposit payment"}</li>
              <li>{isChinaSite ? "出发前需支付全款" : "Full payment required before departure"}</li>
              <li>{isChinaSite ? "行程可能因天气/当地情况而调整" : "Itineraries subject to change due to weather/local conditions"}</li>
              <li>{isChinaSite ? "可能有最低团队人数要求" : "Minimum group sizes may apply"}</li>
              <li>{isChinaSite ? "确认邮件中将提供集合时间和地点的详细信息" : "Meeting times and locations will be provided in confirmation emails"}</li>
              <li>{isChinaSite ? "客户必须携带有效身份证件参加所有旅游活动" : "Clients must bring valid identification for all tour activities"}</li>
            </ul>
          </section>

          {/* Airport Fast Track Service Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "5. 机场快速通道服务条款" : "5. Airport Fast Track Service Terms"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>{isChinaSite ? "服务确认将在抵达前24小时发送" : "Service confirmation sent 24 hours before arrival"}</li>
              <li>{isChinaSite ? "客户必须提供准确的航班详情" : "Client must provide accurate flight details"}</li>
              <li>{isChinaSite ? "未出现政策：错过服务不退款" : "No-show policy: No refund for missed services"}</li>
              <li>{isChinaSite ? "服务可在河内、胡志明市、岘港机场使用" : "Service available at Hanoi, Ho Chi Minh City, Da Nang airports"}</li>
              <li>{isChinaSite ? "航班延误或取消时请立即通知我们" : "Please notify us immediately in case of flight delays or cancellations"}</li>
              <li>{isChinaSite ? "我们的代表将在出口处举牌等候您" : "Our representative will meet you at the arrival gate with a name sign"}</li>
            </ul>
          </section>

          {/* Booking Process */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "6. 预订流程" : "6. Booking Process"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? "我们接受通过以下方式预订："
                : "Reservations are accepted through:"}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
              <li>{isChinaSite ? "在线预订（通过我们的网站）" : "Online booking (through our website)"}</li>
              <li>{isChinaSite ? "电子邮件：info@flyvietnam.help" : "Email: info@flyvietnam.help"}</li>
              <li>{isChinaSite ? "WhatsApp/微信：+84 70 5549868" : "WhatsApp: +84 70 5549868"}</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "7. 付款条款" : "7. Payment Terms"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>{isChinaSite ? "定金：" : "Deposit:"}</strong> {isChinaSite ? "需支付30%定金以确认预订" : "30% deposit required to confirm bookings"}</li>
              <li><strong>{isChinaSite ? "尾款：" : "Final Balance:"}</strong> {isChinaSite ? "须在出发日期前支付" : "Due before travel dates"}</li>
              <li><strong>{isChinaSite ? "信用卡支付：" : "Credit Card Payments:"}</strong> {isChinaSite ? "通过OnePay处理，收取3%服务费" : "Processed via OnePay with 3% service fee"}</li>
              <li><strong>{isChinaSite ? "银行转账：" : "Bank Transfers:"}</strong> {isChinaSite ? "接受多种货币" : "Accepted in multiple currencies"}</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              {isChinaSite
                ? "您应支付在整个付款过程中由您的银行或金融机构产生的所有银行费用、汇率差异、货币调整、交易费和其他此类费用。"
                : "You shall pay for all bank charges, exchange rate differences, currency adjustments, transaction fees and other such charges incurred by your bank or financial institution(s) throughout the payment process."}
            </p>
          </section>

          {/* Cancellation Policies */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "8. 取消政策" : "8. Cancellation Policies"}
            </h2>

            {/* Tour Packages */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {isChinaSite ? "旅游套餐（3天以上）" : "Tour Packages (3+ days)"}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">{isChinaSite ? "出发前时间" : "Time Before Departure"}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">{isChinaSite ? "罚款" : "Penalty"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "60天以上" : "60+ days"}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">{isChinaSite ? "无费用" : "No charge"}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "30-59天" : "30-59 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "30%罚款" : "30% penalty"}</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "15-29天" : "15-29 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "50%罚款" : "50% penalty"}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "7-14天" : "7-14 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "70%罚款" : "70% penalty"}</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "7天以内/未出现" : "Under 7 days/no-show"}</td>
                      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{isChinaSite ? "100%罚款" : "100% penalty"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Halong Bay Cruises */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {isChinaSite ? "下龙湾游船" : "Halong Bay Cruises"}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">{isChinaSite ? "出发前时间" : "Time Before Departure"}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">{isChinaSite ? "罚款" : "Penalty"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "30天以上" : "30+ days"}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">{isChinaSite ? "无费用" : "No charge"}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "11-30天" : "11-30 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "30%罚款" : "30% penalty"}</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "7-10天" : "7-10 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "50%罚款" : "50% penalty"}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "7天以内/未出现" : "Under 7 days/no-show"}</td>
                      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{isChinaSite ? "100%罚款" : "100% penalty"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mekong River Cruises */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {isChinaSite ? "湄公河游船" : "Mekong River Cruises"}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">{isChinaSite ? "出发前时间" : "Time Before Departure"}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">{isChinaSite ? "收费" : "Charge"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "90天以上" : "90+ days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "游船价格的30%" : "30% of cruise price"}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "60-89天" : "60-89 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "50%收费" : "50% charge"}</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "30-59天" : "30-59 days"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "75%收费" : "75% charge"}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "30天以内" : "Under 30 days"}</td>
                      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{isChinaSite ? "100%收费" : "100% charge"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Airport Fast Track Cancellations */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {isChinaSite ? "机场快速通道服务取消" : "Airport Fast Track Service Cancellations"}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>{isChinaSite ? "24小时以上：" : "24+ hours before:"}</strong> {isChinaSite ? "全额退款" : "Full refund"}</li>
                <li><strong>{isChinaSite ? "24小时以内：" : "Under 24 hours:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
                <li><strong>{isChinaSite ? "未出现：" : "No-show:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
                <li><strong>{isChinaSite ? "航班取消/延误：" : "Flight cancelled/delayed:"}</strong> {isChinaSite ? "凭证明全额退款" : "Full refund with proof"}</li>
              </ul>
            </div>

            {/* Day Trip Cancellations */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {isChinaSite ? "一日游取消" : "Day Trip Cancellations"}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>{isChinaSite ? "48小时以上：" : "48+ hours before:"}</strong> {isChinaSite ? "全额退款" : "Full refund"}</li>
                <li><strong>{isChinaSite ? "24-48小时：" : "24-48 hours:"}</strong> {isChinaSite ? "50%退款" : "50% refund"}</li>
                <li><strong>{isChinaSite ? "24小时以内/未出现：" : "Under 24 hours/no-show:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
                <li><strong>{isChinaSite ? "运营商因天气取消：" : "Weather cancellation by operator:"}</strong> {isChinaSite ? "全额退款或改期" : "Full refund or reschedule"}</li>
              </ul>
            </div>
          </section>

          {/* Liability */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "9. 责任" : "9. Liability"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? "本公司不对因以下原因造成的损失承担责任："
                : "The company is not responsible for losses arising from:"}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
              <li>{isChinaSite ? "延误或事故" : "Delays or accidents"}</li>
              <li>{isChinaSite ? "自然灾害" : "Natural disasters"}</li>
              <li>{isChinaSite ? "政治事件" : "Political events"}</li>
              <li>{isChinaSite ? "不可抗力情况" : "Force majeure situations"}</li>
              <li>{isChinaSite ? "航班取消或延误" : "Flight cancellations or delays"}</li>
              <li>{isChinaSite ? "客户提供的信息不正确" : "Incorrect information provided by client"}</li>
            </ul>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                {isChinaSite
                  ? "重要提示：旅客必须获得全面的旅行保险。"
                  : "Important: Travelers must obtain comprehensive travel insurance."}
              </p>
            </div>
          </section>

          {/* Children Rates */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "10. 儿童价格" : "10. Children Rates"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>{isChinaSite ? "4岁以下：" : "Under 4 years:"}</strong> {isChinaSite ? "免费（机票除外）" : "Free (except flights)"}</li>
              <li><strong>{isChinaSite ? "4-11岁：" : "Ages 4-11:"}</strong> {isChinaSite ? "成人价格的50-90%，取决于床位安排" : "50-90% of adult rate depending on bedding arrangements"}</li>
              <li><strong>{isChinaSite ? "11岁以上：" : "11+ years:"}</strong> {isChinaSite ? "适用成人价格" : "Adult rate applies"}</li>
            </ul>
          </section>

          {/* Price Guarantee */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "11. 价格保证" : "11. Price Guarantee"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {isChinaSite
                ? "如果您在预订后24小时内或付款前，在其他网站上找到相同的酒店房间、游船舱位或旅游服务，且预订条件相同，价格更低，我们将匹配差价。"
                : "If you find the same hotel room, cruise cabin, or tour service with identical booking conditions at a lower publicly available rate on another website within 24 hours of your booking or before payment, we will match the difference."}
            </p>
          </section>

          {/* Quality & Money-Back Guarantees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "12. 质量与退款保证" : "12. Quality & Money-Back Guarantees"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? "如果我们的服务未达到承诺的质量标准，我们将提供公平的解决方案。"
                : "Fair solutions are offered for unmet quality standards."}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {isChinaSite
                ? "注意：不包括第三方服务提供商超出我们运营控制范围的变更。"
                : "Note: This excludes third-party service provider changes beyond our operational control."}
            </p>
          </section>

          {/* General */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "13. 一般条款" : "13. General"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? "这些条款和条件以及其中明确提及的任何文件构成我们之间的完整协议。"
                : "These terms and conditions and any document expressly referred to in them constitute the entire agreement between us."}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {siteDisplayName} {isChinaSite
                ? "保留在不通知的情况下更改本协议任何部分的权利，您访问本网站将被视为接受本协议。"
                : "reserves the right to change any part of this agreement without notice, and your access to the site will be considered acceptance of this agreement."}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {isChinaSite
                ? "因本协议引起的任何争议应受越南法律管辖，双方同意接受越南法院的专属管辖权。"
                : "Any dispute arising under this agreement shall be governed by Vietnamese Law, and both parties agree to submit to the exclusive jurisdiction of the courts of Vietnam."}
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "14. 联系信息" : "14. Contact Information"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? "如果您对这些条款和条件有任何疑问，请联系我们："
                : "If you have any questions about these Terms and Conditions, please contact us:"}
            </p>
            <ul className="list-none text-gray-700 dark:text-gray-300 space-y-2 mb-6">
              <li><strong>{isChinaSite ? "电子邮件：" : "Email:"}</strong> <a href="mailto:info@flyvietnam.help" className="text-blue-600 dark:text-blue-400 hover:underline">info@flyvietnam.help</a></li>
              <li><strong>{isChinaSite ? "微信/WhatsApp：" : "WhatsApp:"}</strong> <a href="https://wa.me/84705549868" className="text-blue-600 dark:text-blue-400 hover:underline">+84 70 5549868</a></li>
              <li><strong>{isChinaSite ? "网站：" : "Website:"}</strong> <a href={isChinaSite ? "https://越签.com" : "https://flyvietnam.help"} className="text-blue-600 dark:text-blue-400 hover:underline">{isChinaSite ? "www.越签.com" : "www.flyvietnam.help"}</a></li>
            </ul>

            {/* Office Locations */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Hanoi Office */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isChinaSite ? "河内办公室" : "Hanoi Office"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isChinaSite
                    ? "越南河内市白梅区白梅街459C号维纳建设钻石大厦11层"
                    : "11th Floor, Vinaconex Diamond Tower, 459C Bach Mai Street, Bach Mai Ward, Hanoi, Vietnam"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isChinaSite ? "电话：" : "Tel:"} <a href="tel:+84904699428" className="text-blue-600 dark:text-blue-400 hover:underline">+84 904 699 428</a>
                </p>
              </div>

              {/* Ho Chi Minh City Office */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isChinaSite ? "胡志明市办公室" : "Ho Chi Minh City Office"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isChinaSite
                    ? "越南胡志明市平盛区720A号威霖中央公园7号楼38层"
                    : "Park 7 Building, Floor 38, Vinhomes Central Park, 720A, Binh Thanh District, Ho Chi Minh City, Vietnam"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  WhatsApp: <a href="https://wa.me/84705549868" className="text-blue-600 dark:text-blue-400 hover:underline">+84 705 549 868</a>
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mt-4">
              {isChinaSite
                ? "我们的客户支持团队全天候24/7为您解答任何疑问。"
                : "Our customer support team is available 24/7 to assist you with any inquiries."}
            </p>
          </section>

          {/* Official Partner */}
          <section className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isChinaSite ? "官方合作伙伴" : "Official Partner"}
            </h2>
            <p className="text-amber-600 dark:text-amber-400 font-semibold mb-1">
              CÔNG TY CỔ PHẦN CÔNG NGHỆ DU LỊCH BESTPRICE
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isChinaSite
                ? "营业执照号：0104679428 - 签发日期：2010年5月26日 - 河内投资规划局"
                : "Business License: 0104679428 - Issued: May 26, 2010 - Hanoi DPI"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isChinaSite
                ? "旅行社许可证号：01-1794/2022/SDL-GPLHND"
                : "Tour Operator License: 01-1794/2022/SDL-GPLHND"}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
