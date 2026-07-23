import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, Row, Col, Card, Space, message, Modal, Typography } from "antd";
import { 
  PlusOutlined, SaveOutlined, DeleteOutlined, 
  LogoutOutlined, SearchOutlined, FileExcelOutlined,
  TeamOutlined 
} from "@ant-design/icons";
import API from "../services/api";
// 1. Import library XLSX
import * as XLSX from "xlsx";

const { Text, Title } = Typography;

const Supplier = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supplier/");
      setData(res.data.data);
    } catch (err) {
      message.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Tambahkan Fungsi Export
  const handleExport = () => {
    if (data.length === 0) {
      return message.warning("Tidak ada data untuk di-export");
    }

    try {
      // Mengambil data yang mungkin sudah difilter oleh pencarian
      const filteredData = data.filter(i => 
        i.Nama?.toLowerCase().includes(searchText.toLowerCase())
      );

      // Konversi JSON ke worksheet
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Supplier");

      // Generate file excel dan download
      XLSX.writeFile(workbook, `Data_Supplier_${new Date().toLocaleDateString()}.xlsx`);
      message.success("Berhasil mengunduh file Excel");
    } catch (error) {
      message.error("Gagal export data");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (selectedKey) {
        await API.put(`/supplier/${selectedKey}`, values);
        message.success("Data Berhasil Diperbarui");
      } else {
        await API.post("/supplier/", values);
        message.success("Data Berhasil Disimpan");
      }
      handleNew();
      loadData();
    } catch (e) {
      message.error("Lengkapi data yang diwajibkan");
    }
  };

const handleNew = () => {
    setSelectedKey(null); // Menghapus tanda bahwa kita sedang edit
    form.resetFields();   // Mengosongkan semua kotak input
    message.info("Form telah dikosongkan. Silahkan input data baru.");
  };

  const handleDelete = () => {
    if (!selectedKey) return message.warning("Pilih data yang akan dihapus");
    Modal.confirm({
      title: "Hapus Supplier",
      content: `Apakah Anda yakin ingin menghapus data ${selectedKey}?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        await API.delete(`/supplier/${selectedKey}`);
        handleNew();
        loadData();
      }
    });
  };

  const columns = [
    { title: "KODE", dataIndex: "KodeSupplier", width: 100, render: (text) => <Text strong style={{ color: '#3f51b5' }}>{text}</Text> },
    { title: "NAMA SUPPLIER", dataIndex: "Nama", width: 250 },
    { title: "ALAMAT", dataIndex: "Alamat", ellipsis: true },
    { title: "GROUP", dataIndex: "KdGroup", width: 120 },
    { title: "CONTACT", dataIndex: "Contact", width: 150 },
  ];

  return (
    <div style={{ padding: "20px", background: "#f8f9fa", minHeight: "100vh" }}>
      <Card 
        bordered={false}
        style={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space size="middle">
            <div style={{ background: "#e8eaf6", padding: "10px", borderRadius: "8px" }}>
              <TeamOutlined style={{ color: "#3f51b5", fontSize: "20px" }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Master Supplier</Title>
              <Text type="secondary">Kelola data mitra bisnis dan supplier</Text>
            </div>
          </Space>
          <Input 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Cari supplier..." 
            style={{ width: 300, borderRadius: "8px" }}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        {/* FORM SECTION */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #f0f0f0", marginBottom: "20px" }}>
          <Form form={form} layout="vertical" size="middle">
            <Row gutter={48}>
              <Col span={8}>
                <Form.Item name="KodeSupplier" label="Kode Supplier" rules={[{ required: true }]}>
                  <Input disabled={!!selectedKey} placeholder="Input Kode" style={{ borderRadius: "6px" }} />
                </Form.Item>
                <Form.Item name="Nama" label="Nama Lengkap" rules={[{ required: true }]}>
                  <Input placeholder="Nama Perusahaan/Supplier" style={{ borderRadius: "6px" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="Alamat" label="Alamat Kantor">
                  <Input.TextArea rows={4} placeholder="Alamat lengkap..." style={{ borderRadius: "6px" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
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

        {/* TABLE SECTION */}
        <Table
          dataSource={data.filter(i => i.Nama?.toLowerCase().includes(searchText.toLowerCase()))}
          columns={columns}
          rowKey="KodeSupplier"
          size="middle"
          loading={loading}
          scroll={{ y: 300 }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedKey(record.KodeSupplier);
              form.setFieldsValue(record);
            },
          })}
          rowClassName={(record) => (record.KodeSupplier === selectedKey ? "selected-row-clean" : "")}
          pagination={{ pageSize: 10, size: "small" }}
          style={{ border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" }}
        />

        {/* ACTION TOOLBAR */}
        <div style={{ 
          marginTop: "20px", 
          display: "flex", 
          justifyContent: "flex-end",
          background: "#fff",
          padding: "15px 0",
          borderTop: "1px solid #f0f0f0"
        }}>
          <Space size="small">
            {/* 3. Hubungkan fungsi handleExport ke onClick */}
            <Button 
                icon={<FileExcelOutlined />} 
                style={{ borderRadius: "6px" }}
                onClick={handleExport}
            >
                Export
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleNew} style={{ borderRadius: "6px" }}>Baru</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ background: "#3f51b5", borderRadius: "6px" }}> Simpan Data</Button>
            <Button icon={<DeleteOutlined />} onClick={handleDelete} danger style={{ borderRadius: "6px" }}>Hapus</Button>
            <Button icon={<LogoutOutlined />} style={{ borderRadius: "6px" }}>Keluar</Button>
          </Space>
        </div>
      </Card>

      <style>{`
        .ant-table-thead > tr > th { 
          background: #f8f9fa !important; 
          color: #1a237e !important; 
          font-weight: 600 !important;
          font-size: 12px !important;
          border-bottom: 2px solid #e8eaf6 !important;
        }
        .selected-row-clean { 
          background-color: #f5f6ff !important; 
        }
        .ant-table-row:hover {
          cursor: pointer;
        }
        .ant-form-item-label > label { 
          font-weight: 500;
          color: #595959;
        }
        .ant-input:focus, .ant-input-focused {
          border-color: #3f51b5;
          box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Supplier;
