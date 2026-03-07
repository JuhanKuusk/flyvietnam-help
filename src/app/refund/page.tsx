"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSite } from "@/contexts/SiteContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/ui/footer";
import { Logo } from "@/components/ui/logo";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";

export default function RefundPage() {
  const { t } = useLanguage();
  const { isChinaSite, content } = useSite();

  // Dynamic site display name
  const siteDisplayName = isChinaSite ? "越签.com" : "FlyVietnam.Help";
  const contactEmail = isChinaSite ? "info@越签.com" : "info@flyvietnam.help";

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
            {isChinaSite ? "退款与取消政策" : "Refund & Cancellation Policy"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {siteDisplayName} | {isChinaSite ? "最后更新：2026年3月8日" : "Last updated: March 8, 2026"}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-8">
            {isChinaSite
              ? `在${siteDisplayName}，我们致力于提供优质的服务和客户满意度。本政策概述了我们旅游套餐和机场服务的退款和取消条款。`
              : `At ${siteDisplayName}, we strive to provide excellent service and customer satisfaction. This policy outlines our refund and cancellation terms for our tour packages and airport services.`}
          </p>

          {/* Tour Package Cancellations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "1. 旅游套餐取消（3天以上）" : "1. Tour Package Cancellations (3+ Days)"}
            </h2>
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
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "7天以内/未出现" : "Under 7 days / No-show"}</td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{isChinaSite ? "100%罚款" : "100% penalty"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Halong Bay Cruise Cancellations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "2. 下龙湾游船取消" : "2. Halong Bay Cruise Cancellations"}
            </h2>
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
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{isChinaSite ? "7天以内/未出现" : "Under 7 days / No-show"}</td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{isChinaSite ? "100%罚款" : "100% penalty"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Mekong River Cruise Cancellations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "3. 湄公河游船取消" : "3. Mekong River Cruise Cancellations"}
            </h2>
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
          </section>

          {/* Day Trip & Activity Cancellations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "4. 一日游和活动取消" : "4. Day Trip & Activity Cancellations"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>{isChinaSite ? "48小时以上：" : "48+ hours before:"}</strong> {isChinaSite ? "全额退款" : "Full refund"}</li>
              <li><strong>{isChinaSite ? "24-48小时：" : "24-48 hours:"}</strong> {isChinaSite ? "50%退款" : "50% refund"}</li>
              <li><strong>{isChinaSite ? "24小时以内/未出现：" : "Under 24 hours / No-show:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
              <li><strong>{isChinaSite ? "运营商因天气取消：" : "Weather cancellation by operator:"}</strong> {isChinaSite ? "全额退款或改期" : "Full refund or reschedule"}</li>
            </ul>
          </section>

          {/* Airport Fast Track Service Cancellations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "5. 机场快速通道服务取消" : "5. Airport Fast Track Service Cancellations"}
            </h2>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>{isChinaSite ? "24小时以上取消：" : "24+ hours before arrival:"}</strong> {isChinaSite ? "全额退款" : "Full refund"}</li>
                <li><strong>{isChinaSite ? "24小时以内取消：" : "Under 24 hours:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
                <li><strong>{isChinaSite ? "未出现在机场：" : "No-show at airport:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
                <li><strong>{isChinaSite ? "航班取消/延误：" : "Flight cancelled/delayed:"}</strong> {isChinaSite ? "凭证明全额退款" : "Full refund with proof"}</li>
              </ul>
            </div>
          </section>

          {/* Private Transfer Cancellations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "6. 私人接送取消" : "6. Private Transfer Cancellations"}
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>{isChinaSite ? "24小时以上：" : "24+ hours before:"}</strong> {isChinaSite ? "全额退款" : "Full refund"}</li>
              <li><strong>{isChinaSite ? "12-24小时：" : "12-24 hours:"}</strong> {isChinaSite ? "50%退款" : "50% refund"}</li>
              <li><strong>{isChinaSite ? "12小时以内/未出现：" : "Under 12 hours / No-show:"}</strong> {isChinaSite ? "不退款" : "No refund"}</li>
            </ul>
          </section>

          {/* No Refund Scenarios */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "7. 不予退款的情况" : "7. No Refund Scenarios"}
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
                {isChinaSite ? "在以下情况下不予退款：" : "Refunds are NOT available when:"}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>{isChinaSite ? "您未出现在预订的服务" : "You fail to show up for a booked service"}</li>
                <li>{isChinaSite ? "您在服务确认后更改旅行计划" : "You change travel plans after services are confirmed"}</li>
                <li>{isChinaSite ? "您提供了错误的信息（错误的日期、时间、地点）" : "You provide incorrect information (wrong dates, times, locations)"}</li>
                <li>{isChinaSite ? "服务已按预订成功交付" : "Services were successfully delivered as booked"}</li>
                <li>{isChinaSite ? "由于您的原因造成的延误（迟到集合点、遗忘证件等）" : "Delays caused by you (late to meeting point, forgotten documents, etc.)"}</li>
              </ul>
            </div>
          </section>

          {/* How to Request a Refund */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "8. 如何申请退款" : "8. How to Request a Refund"}
            </h2>
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>
                {isChinaSite ? (
                  <>通过电子邮件 <a href={`mailto:${contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{contactEmail}</a> 或WhatsApp联系我们。</>
                ) : (
                  <>Contact us via email at <a href={`mailto:${contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{contactEmail}</a> or WhatsApp.</>
                )}
              </li>
              <li>
                {isChinaSite
                  ? "提供您的预订确认号和取消原因。"
                  : "Provide your booking confirmation number and reason for cancellation."}
              </li>
              <li>
                {isChinaSite
                  ? "我们将在24-48小时内审核您的请求。"
                  : "We will review your request within 24-48 hours."}
              </li>
              <li>
                {isChinaSite
                  ? "如获批准，退款将在5-10个工作日内处理到您的原始付款方式。"
                  : "If approved, refunds are processed within 5-10 business days to your original payment method."}
              </li>
            </ol>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "9. 联系我们" : "9. Contact Us"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {isChinaSite
                ? "如需退款请求或对本政策有疑问："
                : "For refund requests or questions about this policy:"}
            </p>
            <ul className="list-none text-gray-700 dark:text-gray-300 space-y-2">
              <li>
                <strong>{isChinaSite ? "电子邮件：" : "Email:"}</strong>{" "}
                <a href={`mailto:${contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{contactEmail}</a>
              </li>
              <li>
                <strong>{isChinaSite ? "微信/WhatsApp：" : "WhatsApp:"}</strong>{" "}
                <a href="https://wa.me/84705549868" className="text-blue-600 dark:text-blue-400 hover:underline">+84 70 5549868</a>
              </li>
              <li>
                <strong>{isChinaSite ? "网站：" : "Website:"}</strong>{" "}
                <a href={isChinaSite ? "https://越签.com" : "https://flyvietnam.help"} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {isChinaSite ? "www.越签.com" : "www.flyvietnam.help"}
                </a>
              </li>
            </ul>
          </section>

          {/* Official Partner Section */}
          <section className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isChinaSite ? "官方合作伙伴" : "Official Partner"}
            </h2>
            <p className="text-amber-600 dark:text-amber-400 font-semibold mb-2">
              CÔNG TY CỔ PHẦN CÔNG NGHỆ DU LỊCH BESTPRICE
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {isChinaSite
                ? "营业执照号：0104679428 - 签发日期：2010年5月26日 - 河内投资规划局 | 旅行社许可证号：01-1794/2022/SDL-GPLHND"
                : "Business License: 0104679428 - Issued: May 26, 2010 - Hanoi DPI | Tour Operator License: 01-1794/2022/SDL-GPLHND"}
            </p>

            {/* Two Office Locations */}
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              {/* Hanoi Office */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {isChinaSite ? "河内办公室" : "Hanoi Office"}
                </p>
                <p>{isChinaSite ? "电话" : "Tel"}: <a href="tel:+84904699428" className="text-blue-600 dark:text-blue-400 hover:underline">+84 904 699 428</a></p>
                <p className="mt-1 text-xs">
                  {isChinaSite
                    ? "越南河内市白梅区白梅街459C号维纳建设钻石大厦11层"
                    : "11th Floor, Vinaconex Diamond Tower, 459C Bach Mai Street, Bach Mai Ward, Hanoi, Vietnam"}
                </p>
              </div>

              {/* Ho Chi Minh City Office */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {isChinaSite ? "胡志明市办公室" : "Ho Chi Minh City Office"}
                </p>
                <p>{isChinaSite ? "微信/WhatsApp" : "WhatsApp"}: <a href="https://wa.me/84705549868" className="text-blue-600 dark:text-blue-400 hover:underline">+84 705 549 868</a></p>
                <p className="mt-1 text-xs">
                  {isChinaSite
                    ? "越南胡志明市平盛区720A号威霖中央公园7号楼38层"
                    : "Park 7 Building, Floor 38, Vinhomes Central Park, 720A, Binh Thanh District, Ho Chi Minh City, Vietnam"}
                </p>
              </div>
            </div>
          </section>

          {/* Customer Support */}
          <section>
            <p className="text-gray-700 dark:text-gray-300">
              {isChinaSite
                ? "我们的客户支持团队全天候24/7为您服务。"
                : "Our customer support team is available 24/7 to assist you."}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
