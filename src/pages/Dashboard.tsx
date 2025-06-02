import React from "react";

const Dashboard = () => {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://fastapi-production-93ec.up.railway.app/?orgId=1&from=now-6h&to=now&timezone=browser"
        className="w-full h-full border-0"
        title="Grafana Dashboard"
      />
    </div>
  );
};

export default Dashboard;
