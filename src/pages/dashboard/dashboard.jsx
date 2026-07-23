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
  // Data dummy untuk statistik
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
    <div style={{ background: "#F0F2F5", padding: "20px", minHeight: "100vh" }}>
      <WelcomeUser />

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        {stats.map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              bordered={false}
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
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
                  }}
                >
                  {item.icon}
                </div>
                <Statistic
                  title={
                    <span style={{ color: "#8C8C8C", fontWeight: 500 }}>
                      {item.title}
                    </span>
                  }
                  value={item.value}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontWeight: "bold", fontSize: "20px" }}
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
            style={{ borderRadius: "16px", height: "300px" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={invoiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
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
            style={{ borderRadius: "16px", height: "300px" }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#52C41A" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
