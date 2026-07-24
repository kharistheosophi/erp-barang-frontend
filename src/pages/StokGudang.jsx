import React, { useEffect, useState } from "react";
import { 
  Table, Button, message, Tag, Space, Card, 
  Typography, Modal, Form, Input, InputNumber, Row, Col, Select
} from "antd";
import { 
  ReloadOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, HomeOutlined, SearchOutlined, WarningOutlined
} from "@ant-design/icons";
import API from "../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const StokGudang = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [listBarang, setListBarang] = useState([]);
  const [listGudang, setListGudang] = useState([]);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/stokgudang/");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error("Gagal mengambil data stok");
    } finally {
      setLoading(false);
    }
  };

  const loadReferences = async () => {
    try {
      const resBrg = await API.get("/barang/");
      const resGdg = await API.get("/gudang/");
      setListBarang(resBrg.data.data);
      setListGudang(resGdg.data.data);
    } catch (e) {
      console.error("Gagal memuat referensi");
    }
  };

  useEffect(() => { 
    loadData(); 
    loadReferences();
  }, []);

  const handleDelete = (kodeGudang, kodeBrg) => {
    Modal.confirm({
      title: <Text strong style={{ fontSize: '18px' }}>Hapus Stok?</Text>,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: "Data stok di gudang ini akan dihapus permanen. Lanjutkan?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        try {
          await API.delete(`/stokgudang/${kodeGudang}/${kodeBrg}`);
          message.success("Data stok berhasil dihapus");
          loadData();
        } catch (error) {
          message.error("Gagal menghapus data");
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await API.put(`/stokgudang/${editingItem.KodeGudang}/${editingItem.KodeBrg}`, values);
        message.success("Stok diperbarui");
      } else {
        await API.post("/stokgudang/", values);
        message.success("Stok baru ditambahkan");
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
      form.setFieldsValue({ QtyStok: 0, MinStok: 0 });
    }
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => 
    item.NamaBrg?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.NamaGudang?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.KodeBrg?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: "GUDANG", 
      dataIndex: "NamaGudang", 
      key: "NamaGudang",
      width: 180,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1e293b' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.KodeGudang}</Text>
        </Space>
      )
    },
    { 
      title: "BARANG", 
      dataIndex: "NamaBrg", 
      key: "NamaBrg",
      width: 180,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#6366f1' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.KodeBrg}</Text>
        </Space>
      )
    },
    { 
      title: "QTY STOK", 
      dataIndex: "QtyStok", 
      key: "QtyStok",
      align: 'right',
      width: 120,
      render: (v) => <Text strong>{v.toLocaleString('id-ID')}</Text>
    },
    { 
      title: "MIN STOK", 
      dataIndex: "MinStok", 
      key: "MinStok",
      align: 'right',
      width: 120,
      render: (v) => <Text type="secondary">{v.toLocaleString('id-ID')}</Text>
    },
    { 
      title: "STATUS", 
      dataIndex: "QtyStok", 
      align: "center",
      width: 130,
      render: (qty, record) => {
        const isLow = qty <= record.MinStok;
        return (
          <Tag 
            color={isLow ? "volcano" : "green"} 
            icon={isLow ? <WarningOutlined /> : null}
            style={{ borderRadius: '12px', padding: '0 12px' }}
          >
            {isLow ? 'Low Stock' : 'Tersedia'}
          </Tag>
        );
      }
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
            style={{ color: '#6366f1' }} 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.KodeGudang, record.KodeBrg)} 
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
                <Title level={3} style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)' }}>Stok Per Gudang</Title>
                <Text type="secondary" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>Pantau ketersediaan barang di setiap lokasi gudang</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md="auto" style={{ width: '100%' }}>
            <Space size="small" wrap className="toolbar-space" style={{ width: '100%' }}>
              <Input 
                placeholder="Cari barang atau gudang..." 
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
                Tambah Stok
              </Button>
            </Space>
          </Col>
        </Row>

        <Table 
          dataSource={filteredData} 
          columns={columns} 
          rowKey={(record) => `${record.KodeGudang}-${record.KodeBrg}`} 
          loading={loading} 
          pagination={{ pageSize: 7, simple: true, responsive: true }}
          scroll={{ x: 850 }}
          className="modern-table"
        />

        <Modal 
          title={<Text strong style={{ fontSize: '18px' }}>{editingItem ? "Edit Batas Stok" : "Tambah Stok di Gudang"}</Text>} 
          open={isModalOpen} 
          onOk={handleSave} 
          onCancel={() => setIsModalOpen(false)}
          width="90%"
          style={{ maxWidth: 500 }}
          centered
        >
          <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
            <Form.Item name="KodeGudang" label="Pilih Gudang" rules={[{ required: true }]}>
              <Select placeholder="Pilih Gudang" disabled={!!editingItem}>
                {listGudang.map(g => <Option key={g.KodeGudang} value={g.KodeGudang}>{g.NamaGudang}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="KodeBrg" label="Pilih Barang" rules={[{ required: true }]}>
              <Select placeholder="Pilih Barang" disabled={!!editingItem}>
                {listBarang.map(b => <Option key={b.KodeBrg} value={b.KodeBrg}>{b.NamaBrg}</Option>)}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={12}>
                <Form.Item name="QtyStok" label="Stok Saat Ini" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="MinStok" label="Minimal Stok" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
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

export default StokGudang;