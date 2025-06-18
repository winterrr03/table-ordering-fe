import { ABSADashboard } from "./absa-dashboard";

export default function ABSAAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Phân tích phản hồi, đánh giá theo khía cạnh
      </h1>
      <ABSADashboard />
    </div>
  );
}
