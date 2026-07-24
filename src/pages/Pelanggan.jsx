import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Row, Col, Card, Space, message, Modal, Typography } from "antd";
import { 
  PlusOutlined, SaveOutlined, DeleteOutlined, 
  SearchOutlined, FileExcelOutlined, UserOutlined
} from "@ant-design/icons";
import API from "../services/api";
import * as XLSX from "xlsx";

const { Text, Title } = Typography;

const Pelanggan = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/pelanggan/");
      setData(res.data.data || []);
    } catch (err) {
      message.error("Gagal memuat data pelanggan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleExport = () => {
    if (data.length === 0) return message.warning("Tidak ada data untuk di-export");
    try {
      const filteredData = data.filter(i => i.Nama?.toLowerCase().includes(searchText.toLowerCase()));
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pelanggan");
      XLSX.writeFile(workbook, `Data_Pelanggan_${new Date().toLocaleDateString()}.xlsx`);
      message.success("Berhasil mengunduh file Excel");
    } catch (error) {
      message.error("Gagal export data");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (selectedKey) {
        await API.put(`/pelanggan/${selectedKey}`, values);
        message.success("Data Berhasil Diperbarui");
      } else {
        await API.post("/pelanggan/", values);
        message.success("Data Berhasil Disimpan");
      }
      handleNew();
      loadData();
    } catch (e) {
      message.error("Lengkapi data yang diwajibkan");
    }
  };

  const handleNew = () => {
    setSelectedKey(null);
    form.resetFields();
  };

  const handleDelete = () => {
    if (!selectedKey) return message.warning("Pilih data yang akan dihapus");
    Modal.confirm({
      title: "Hapus Pelanggan",
      content: `Apakah Anda yakin ingin menghapus data ${selectedKey}?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        await API.delete(`/pelanggan/${selectedKey}`);
        handleNew();
        loadData();
      }
    });
  };

  const columns = [
    { title: "KODE", dataIndex: "KodePlg", width: 100, render: (text) => <Text strong style={{ color: '#0d9488' }}>{text}</Text> },
    { title: "NAMA PELANGGAN", dataIndex: "Nama", width: 220 },
    { title: "ALAMAT", dataIndex: "Alamat", width: 250, ellipsis: true },
    { title: "GROUP", dataIndex: "KdGroup", width: 120 },
    { title: "CONTACT", dataIndex: "Contact", width: 150 },
  ];

  return (
    <div style={{ padding: "0px", minHeight: "100vh" }}>
      <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
          <Col xs={24} md="auto">
            <Space size="middle">
              <div style={{ background: "#ccfbf1", padding: "10px", borderRadius: "8px" }}>
                <UserOutlined style={{ color: "#0d9488", fontSize: "20px" }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>Master Pelanggan</Title>
                <Text type="secondary">Kelola data pembeli produk</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md="auto">
            <Input 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Cari pelanggan..." 
              style={{ width: '100%', maxWidth: 300, borderRadius: "8px" }}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #f0f0f0", marginBottom: "20px" }}>
          <Form form={form} layout="vertical" size="middle">
            <Row gutter={[32, 0]}>
              <Col xs={24} md={8}>
                <Form.Item name="KodePlg" label="Kode Pelanggan" rules={[{ required: true }]}>
                  <Input disabled={!!selectedKey} placeholder="Input Kode" style={{ borderRadius: "6px" }} />
                </Form.Item>
                <Form.Item name="Nama" label="Nama Lengkap" rules={[{ required: true }]}>
                  <Input placeholder="Nama Pelanggan/Toko" style={{ borderRadius: "6px" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="Alamat" label="Alamat">
                  <Input.TextArea rows={4} placeholder="Alamat lengkap..." style={{ borderRadius: "6px" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="KdGroup" label="Kategori Group">
                  <Input placeholder="Contoh: GRP01" style={{ borderRadius: "6px" }} />
                </Form.Item>
                <Form.Item name="Contact" label="No. Telepon">
                  <Input placeholder="0812xxxx" style={{ borderRadius: "6px" }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        <Table
          dataSource={data.filter(i => i.Nama?.toLowerCase().includes(searchText.toLowerCase()))}
          columns={columns}
          rowKey="KodePlg"
          size="middle"
          loading={loading}
          scroll={{ x: 800, y: 300 }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedKey(record.KodePlg);
              form.setFieldsValue(record);
            },
          })}
          rowClassName={(record) => (record.KodePlg === selectedKey ? "selected-row-clean" : "")}
          pagination={{ pageSize: 10, size: "small" }}
          style={{ border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" }}
        />

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", flexWrap: "wrap", background: "#fff", padding: "15px 0", borderTop: "1px solid #f0f0f0" }}>
          <Space size="small" wrap>
            <Button icon={<FileExcelOutlined />} style={{ borderRadius: "6px" }} onClick={handleExport}>Export</Button>
            <Button icon={<PlusOutlined />} onClick={handleNew} style={{ borderRadius: "6px" }}>Baru</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ background: "#0d9488", borderRadius: "6px" }}>Simpan Data</Button>
            <Button icon={<DeleteOutlined />} onClick={handleDelete} danger style={{ borderRadius: "6px" }}>Hapus</Button>
          </Space>
        </div>
      </Card>

      <style>{`
        .ant-table-thead > tr > th { 
          background: #f8f9fa !important; 
          color: #134e4a !important; 
          font-weight: 600 !important;
          font-size: 12px !important;
          border-bottom: 2px solid #ccfbf1 !important;
        }
        .selected-row-clean { background-color: #f0fdfa !important; }
        .ant-table-row:hover { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Pelanggan;