import React, { useEffect, useState } from "react";
import { 
  Table, Button, message, Tag, Space, Card, 
  Typography, Modal, Form, Input, Row, Col 
} from "antd";
import { 
  ReloadOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, HomeOutlined, SearchOutlined
} from "@ant-design/icons";
import API from "../services/api";

const { Title, Text } = Typography;

const Gudang = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/gudang/");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error("Gagal mengambil data gudang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = (kode) => {
    Modal.confirm({
      title: <Text strong style={{ fontSize: '18px' }}>Hapus Gudang?</Text>,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: "Data gudang ini akan dihapus permanen. Pastikan tidak ada stok yang masih terkait. Lanjutkan?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        try {
          await API.delete(`/gudang/${kode}`);
          message.success("Gudang berhasil dihapus");
          loadData();
        } catch (error) {
          message.error("Gagal menghapus gudang (kemungkinan masih ada stok terkait)");
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await API.put(`/gudang/${editingItem.KodeGudang}`, values);
        message.success("Data gudang diperbarui");
      } else {
        await API.post("/gudang/", values);
        message.success("Gudang baru ditambahkan");
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      message.error("Periksa kembali inputan Anda");
    }
  };

  const showModal = (record = null) => {
    setEditingItem(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      form.setFieldsValue({ Status: "1" });
    }
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => 
    item.NamaGudang?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.KodeGudang?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: "KODE", 
      dataIndex: "KodeGudang", 
      key: "KodeGudang", 
      width: 120,
      render: (text) => <Tag color="green" style={{ fontWeight: '600', borderRadius: '4px' }}>{text}</Tag>
    },
    { 
      title: "NAMA GUDANG", 
      dataIndex: "NamaGudang", 
      key: "NamaGudang",
      width: 200,
      render: (text) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>
    },
    { 
      title: "ALAMAT", 
      dataIndex: "Alamat", 
      key: "Alamat",
      width: 250,
      ellipsis: true
    },
    { 
      title: "STATUS", 
      dataIndex: "Status", 
      align: "center",
      width: 100,
      render: (v) => (
        <Tag 
          color={v === "1" ? "green" : "default"} 
          style={{ borderRadius: '12px', padding: '0 12px', border: 'none' }}
        >
          {v === "1" ? 'Aktif' : 'Nonaktif'}
        </Tag>
      )
    },
    {
      title: "AKSI",
      key: "action",
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            style={{ color: '#22c55e' }} 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.KodeGudang)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="page-wrapper" style={{ padding: '0px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: '16px' } }}
        className="page-card"
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} md="auto">
            <Space size="middle">
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <HomeOutlined style={{ fontSize: '24px', color: '#22c55e' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>Master Gudang</Title>
                <Text type="secondary" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>Kelola daftar lokasi gudang perusahaan</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md="auto" style={{ width: '100%' }}>
            <Space size="small" wrap style={{ width: '100%' }} className="toolbar-space">
              <Input 
                placeholder="Cari nama atau kode gudang..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250, maxWidth: '100%', borderRadius: '8px' }}
                className="search-input-responsive"
                allowClear
              />
              <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading} />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
                style={{ borderRadius: '8px', background: '#22c55e', border: 'none' }}
                className="add-btn-responsive"
              >
                Tambah Gudang
              </Button>
            </Space>
          </Col>
        </Row>

        <Table 
          dataSource={filteredData} 
          columns={columns} 
          rowKey="KodeGudang" 
          loading={loading} 
          pagination={{ pageSize: 7, simple: true, responsive: true }}
          scroll={{ x: 700 }}
          className="modern-table"
          size="middle"
        />

        <Modal 
          title={<Text strong style={{ fontSize: '18px' }}>{editingItem ? "Edit Gudang" : "Tambah Gudang Baru"}</Text>} 
          open={isModalOpen} 
          onOk={handleSave} 
          onCancel={() => setIsModalOpen(false)}
          width="90%"
          style={{ maxWidth: 500 }}
          okText="Simpan"
          cancelText="Batal"
          centered
        >
          <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
            <Form.Item name="KodeGudang" label="Kode Gudang" rules={[{ required: true }]}>
              <Input placeholder="Contoh: G001" disabled={!!editingItem} style={{ borderRadius: '6px' }} />
            </Form.Item>
            <Form.Item name="NamaGudang" label="Nama Gudang" rules={[{ required: true }]}>
              <Input placeholder="Contoh: Gudang Utama" style={{ borderRadius: '6px' }} />
            </Form.Item>
            <Form.Item name="Alamat" label="Alamat">
              <Input.TextArea rows={3} placeholder="Alamat lengkap gudang..." style={{ borderRadius: '6px' }} />
            </Form.Item>
            <Form.Item name="Status" hidden><Input /></Form.Item>
          </Form>
        </Modal>
      </Card>

      <style>{`
        .modern-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .page-card .ant-card-body { padding: 12px !important; }
          .toolbar-space { flex-direction: column; align-items: stretch !important; }
          .toolbar-space > * { width: 100% !important; }
          .search-input-responsive { width: 100% !important; }
          .add-btn-responsive { width: 100%; justify-content: center; }
        }

        @media (max-width: 480px) {
          .modern-table .ant-table-thead > tr > th,
          .modern-table .ant-table-tbody > tr > td {
            font-size: 12px !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Gudang;