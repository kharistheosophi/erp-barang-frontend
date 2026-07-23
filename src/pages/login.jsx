import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await API.post("/login", {
        username: values.username,
        password: values.password,
      });

      console.log("Login berhasil:", res.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      message.success(res.data.message || "Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login gagal:", err.response || err);
      message.error(err.response?.data?.error || "Login gagal! Cek Nama dan Password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#2f2f2f",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <Card
        bordered={false}
        style={{
          textAlign: "center",
          width: "100%",
          maxWidth: 400,
          margin: "0 auto",
          boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
          borderRadius: "12px",
        }}
      >
        <Form onFinish={handleLogin} className="login-form">
          <h1 style={{ marginBottom: 25 }}>Login</h1>

          <Form.Item
            name="username"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="User Name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password wajib diisi" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{ marginBottom: 15 }}
          >
            Log in
          </Button>
        </Form>
      </Card>

      <style>{`
        @media (max-width: 480px) {
          .login-form h1 { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}