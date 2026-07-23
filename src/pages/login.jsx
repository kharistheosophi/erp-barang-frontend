import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Avatar, message } from "antd"; // Import message
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function Login() {
  // HAPUS: const [nama, setNama] = useState("");
  // HAPUS: const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // TERIMA 'values' LANGSUNG DARI Form.onFinish
  const handleLogin = async (values) => { 
    try {
      const res = await API.post("/login", {
        username: values.username,
        password: values.password,
      });

      console.log("Login berhasil:", res.data);

      // Pastikan res.data.data ada (sesuai format blueprint login yang saya berikan)
      localStorage.setItem("user", JSON.stringify(res.data.data)); 
      
      message.success(res.data.message || "Login berhasil!");

      navigate("/dashboard"); // Arahkan ke dashboard
    } catch (err) {
      console.error("Login gagal:", err.response || err);
      // Tampilkan error dari backend jika ada (misal 401: Nama/Password salah)
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
        {/* ... (Avatar dan Card tetap sama) ... */}

        <Card
          bordered={false}
          style={{
            textAlign: "center",
            width: 400,
            margin: "0 auto",
            boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
          }}
        >
          {/* UBAH onFinish untuk memanggil handler langsung */}
          <Form onFinish={handleLogin} className="login-form"> 
            <h1 style={{ marginBottom: 25 }}>Login</h1>

            <Form.Item
              name="username"
              rules={[{ required: true, message: "Nama wajib diisi" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="User Name"
                // HAPUS: onChange={(e) => setNama(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password wajib diisi" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                // HAPUS: onChange={(e) => setPassword(e.target.value)}
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