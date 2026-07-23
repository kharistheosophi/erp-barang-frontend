import React, { useEffect, useState } from "react";
import { 
  Table, Button, message, Tag, Space, Card, 
  Typography, Modal, Form, Input, InputNumber, Row, Col, Divider 
} from "antd";
import { 
  ReloadOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, BoxPlotOutlined, InfoCircleOutlined, DollarOutlined,
  SearchOutlined
} from "@ant-design/icons";
import API from "../services/api";

const { Title, Text } = Typography;

const Barang = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/barang/");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error("Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = (kode) => {
    Modal.confirm({
      title: <Text strong style={{ fontSize: '18px' }}>Hapus Barang?</Text>,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: "Data yang dihapus tidak dapat dipulihkan. Apakah Anda yakin?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk: async () => {
        try {
          await API.delete(`/barang/${kode}`);
          message.success("Barang berhasil dihapus");
          loadData();
        } catch (error) {
          message.error("Gagal menghapus barang");
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await API.put(`/barang/${editingItem.KodeBrg}`, values);
        message.success("Data barang diperbarui");
      } else {
        await API.post("/barang/", values);
        message.success("Barang baru ditambahkan");
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
      form.setFieldsValue({ Status: "1", HargaBeli: 0, HargaJual: 0, Stok: 0 });
    }
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => 
    item.NamaBrg?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.KodeBrg?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: "KODE", 
      dataIndex: "KodeBrg", 
      key: "KodeBrg", 
      width: 120,
      render: (text) => <Tag color="blue" style={{ fontWeight: '600', borderRadius: '4px' }}>{text}</Tag>
    },
    { 
      title: "NAMA BARANG", 
      dataIndex: "NamaBrg", 
      key: "NamaBrg",
      render: (text) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>
    },
    { title: "KEMASAN", dataIndex: "Kemasan", key: "Kemasan", width: 100 },
    { 
      title: "HARGA JUAL", 
      dataIndex: "HargaJual", 
      align: 'right',
      render: (v) => <Text style={{ color: '#059669', fontWeight: '600' }}>{`Rp ${Number(v).toLocaleString('id-ID')}`}</Text>
    },
    { 
      title: "STOK", 
      dataIndex: "Stok", 
      align: "center",
      width: 100,
      render: (v) => (
        <Tag 
          color={v > 10 ? "green" : "volcano"} 
          style={{ borderRadius: '12px', padding: '0 12px', border: 'none' }}
        >
          {v} {v > 10 ? 'Aman' : 'Tipis'}
        </Tag>
      )
    },
    {
      title: "AKSI",
      key: "action",
      align: 'center',
      width: 120,
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
            onClick={() => handleDelete(record.KodeBrg)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
      >
        {/* Header Table */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
          <Col>
            <Space size="middle">
              <div style={{ 
                background: '#f5f3ff', padding: '12px', borderRadius: '12px' 
              }}>
                <BoxPlotOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>Data Inventori</Title>
                <Text type="secondary">Kelola stok dan informasi barang Anda</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="small">
              <Input 
                placeholder="Cari nama atau kode..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250, borderRadius: '8px' }}
                allowClear
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadData} 
                loading={loading}
                style={{ borderRadius: '8px' }}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
                style={{ 
                  borderRadius: '8px', 
                  background: '#6366f1', 
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)' 
                }}
              >
                Tambah Barang
              </Button>
            </Space>
          </Col>
        </Row>

        <Table 
          dataSource={filteredData} 
          columns={columns} 
          rowKey="KodeBrg" 
          loading={loading} 
          pagination={{ pageSize: 7 }}
          className="modern-table"
        />

        {/* MODAL EDIT/TAMBAH */}
        <Modal 
          title={
            <div style={{ paddingBottom: '10px' }}>
              <Text strong style={{ fontSize: '18px' }}>
                {editingItem ? "Edit Informasi Barang" : "Tambah Barang Baru"}
              </Text>
            </div>
          } 
          open={isModalOpen} 
          onOk={handleSave} 
          onCancel={() => setIsModalOpen(false)}
          width={600}
          okText="Simpan"
          cancelText="Batal"
          centered
          styles={{ body: { paddingTop: '10px' } }}
        >
          <Form form={form} layout="vertical">
            <Divider orientation="left" plain style={{ borderColor: '#f1f5f9' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>INFORMASI UMUM</Text>
            </Divider>
            
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item name="KodeBrg" label="Kode Barang" rules={[{ required: true }]}>
                  <Input placeholder="Contoh: BRG001" disabled={!!editingItem} style={{ borderRadius: '6px' }} />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item name="NamaBrg" label="Nama Barang" rules={[{ required: true }]}>
                  <Input placeholder="Masukkan nama barang" style={{ borderRadius: '6px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="Kemasan" label="Kemasan"><Input placeholder="Box, Pcs, dll" style={{ borderRadius: '6px' }} /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="Satuan" label="Satuan"><Input placeholder="Unit, Kg, dll" style={{ borderRadius: '6px' }} /></Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain style={{ borderColor: '#f1f5f9' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>HARGA & STOK</Text>
            </Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="HargaBeli" label="Harga Beli">
                  <InputNumber 
                    style={{ width: '100%', borderRadius: '6px' }} 
                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={v => v.replace(/\Rp\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="HargaJual" label="Harga Jual">
                  <InputNumber 
                    style={{ width: '100%', borderRadius: '6px' }} 
                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={v => v.replace(/\Rp\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="Stok" label="Stok"><InputNumber style={{ width: '100%', borderRadius: '6px' }} min={0} /></Form.Item>
              </Col>
            </Row>
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
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .modern-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc !important;
          padding: 14px 16px !important;
        }
        .ant-modal-content {
          border-radius: 16px !important;
        }
        .ant-btn-primary {
          background: #6366f1 !important;
        }
      `}</style>
    </div>
  );
};

export default Barang;