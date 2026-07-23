import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Avatar, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (values) => { 
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
    }
  };

  return (
    <div 
        style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#2f2f2f"
        }}
    >
      <div style={{ textAlign: "center" }}>
        <Card
          bordered={false}
          style={{
            textAlign: "center",
            width: 400,
            margin: "0 auto",
            boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
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
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password wajib diisi" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ marginBottom: 15 }}
            >
              Log in
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
