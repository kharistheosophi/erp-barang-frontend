import React, { useEffect, useState } from "react";
import { 
  Table, Button, message, Tag, Space, Card, 
  Typography, Modal, Form, Input, InputNumber, Row, Col, Divider, Select
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
  
  // State untuk dropdown referensi
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

  // Mengambil data referensi untuk Select Box
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
          // Menyesuaikan dengan route backend /<kode_gudang>/<kode_brg>
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
        // Update menggunakan 2 parameter primary key
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
      render: (v) => <Text strong>{v.toLocaleString('id-ID')}</Text>
    },
    { 
      title: "MIN STOK", 
      dataIndex: "MinStok", 
      key: "MinStok",
      align: 'right',
      render: (v) => <Text type="secondary">{v.toLocaleString('id-ID')}</Text>
    },
    { 
      title: "STATUS", 
      dataIndex: "QtyStok", 
      align: "center",
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
    <div style={{ padding: '0px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
          <Col>
            <Space size="middle">
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px' }}>
                <HomeOutlined style={{ fontSize: '24px', color: '#22c55e' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>Stok Per Gudang</Title>
                <Text type="secondary">Pantau ketersediaan barang di setiap lokasi gudang</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="small">
              <Input 
                placeholder="Cari barang atau gudang..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250, borderRadius: '8px' }}
                allowClear
              />
              <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading} />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
                style={{ borderRadius: '8px', background: '#22c55e', border: 'none' }}
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
          pagination={{ pageSize: 7 }}
          className="modern-table"
        />

        <Modal 
          title={<Text strong style={{ fontSize: '18px' }}>{editingItem ? "Edit Batas Stok" : "Tambah Stok di Gudang"}</Text>} 
          open={isModalOpen} 
          onOk={handleSave} 
          onCancel={() => setIsModalOpen(false)}
          width={500}
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
              <Col span={12}>
                <Form.Item name="QtyStok" label="Stok Saat Ini" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
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
      `}</style>
    </div>
  );
};

export default StokGudang;
