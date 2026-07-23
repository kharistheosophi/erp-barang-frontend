import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  DollarCircleOutlined,
  SwapOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import WelcomeUser from "../../components/WelcomeUser";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: 32350,
      icon: <DollarCircleOutlined />,
      color: "#FFFBE6",
      iconColor: "#FAAD14",
    },
    {
      title: "Total Expenses",
      value: 6000,
      icon: <SwapOutlined />,
      color: "#F9F0FF",
      iconColor: "#722ED1",
    },
    {
      title: "Accounts Receivable",
      value: 56034,
      icon: <FileTextOutlined />,
      color: "#E6F7FF",
      iconColor: "#1890FF",
    },
    {
      title: "Accounts Payable",
      value: 67083,
      icon: <FileTextOutlined />,
      color: "#FFF1F0",
      iconColor: "#F5222D",
    },
  ];

  const invoiceData = [
    { month: "Jan", amount: 4000 },
    { month: "Feb", amount: 3000 },
    { month: "Mar", amount: 5000 },
    { month: "Apr", amount: 4780 },
    { month: "May", amount: 5890 },
    { month: "Jun", amount: 6390 },
  ];

  const salesForecastData = [
    { month: "Jul", sales: 5200 },
    { month: "Aug", sales: 6100 },
    { month: "Sep", sales: 7000 },
    { month: "Oct", sales: 6800 },
    { month: "Nov", sales: 7600 },
    { month: "Dec", sales: 8200 },
  ];

  return (
    <div className="dashboard-wrapper" style={{ background: "#F0F2F5", padding: "20px", minHeight: "100vh" }}>
      <WelcomeUser />

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }} className="stats-row">
        {stats.map((item, idx) => (
          <Col xs={12} sm={12} lg={6} key={idx}>
            <Card
              bordered={false}
              className="stat-card"
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="stat-icon-box"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: item.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "24px",
                    color: item.iconColor,
                    marginRight: "16px",
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </div>
                <Statistic
                  title={
                    <span className="stat-title" style={{ color: "#8C8C8C", fontWeight: 500 }}>
                      {item.title}
                    </span>
                  }
                  value={item.value}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontWeight: "bold", fontSize: "20px" }}
                  className="stat-value"
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={12}>
          <Card
            title="Invoices"
            bordered={false}
            className="chart-card"
            style={{ borderRadius: "16px" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={invoiceData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1890FF"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Sales Forecast"
            bordered={false}
            className="chart-card"
            style={{ borderRadius: "16px" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesForecastData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#52C41A" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <style>{`
        .chart-card .ant-card-body {
          padding-top: 8px;
        }

        /* Tablet */
        @media (max-width: 768px) {
          .dashboard-wrapper { padding: 16px !important; }
        }

        /* Mobile */
        @media (max-width: 576px) {
          .dashboard-wrapper { padding: 12px !important; }
          .stat-card .ant-card-body { padding: 14px !important; }
          .stat-icon-box { width: 40px !important; height: 40px !important; font-size: 20px !important; }
          .stat-value .ant-statistic-content { font-size: 17px !important; }
          .stat-title { font-size: 12px !important; }
        }

        /* Mobile sangat sempit */
        @media (max-width: 360px) {
          .stat-card .ant-card-body { padding: 10px !important; }
          .stat-icon-box { width: 34px !important; height: 34px !important; font-size: 18px !important; margin-right: 10px !important; }
          .stat-value .ant-statistic-content { font-size: 15px !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;