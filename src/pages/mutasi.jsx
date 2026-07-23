import React, { useEffect, useState } from "react";
import { 
  Table, Button, message, Tag, Space, Card, 
  Typography, Row, Col, Input 
} from "antd";
import { 
  ReloadOutlined, SearchOutlined, 
  ArrowUpOutlined, ArrowDownOutlined, HistoryOutlined 
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const MutasiStok = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/mutasi/");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      message.error("Gagal mengambil data mutasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredData = data.filter(item => 
    item.KodeBrg?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.RefTransaksi?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.TypeTransaksi?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: "TANGGAL", 
      dataIndex: "Tanggal", 
      key: "Tanggal", 
      width: 180,
      render: (text) => (
        <Text style={{ color: '#64748b', fontSize: '13px' }}>
          {new Date(text).toLocaleString('id-ID')}
        </Text>
      )
    },
    { 
      title: "BARANG", 
      dataIndex: "KodeBrg", 
      key: "KodeBrg", 
      width: 120,
      render: (text) => <Tag color="blue" style={{ fontWeight: '600', borderRadius: '4px' }}>{text}</Tag>
    },
    { 
      title: "GUDANG", 
      dataIndex: "KodeGudang", 
      key: "KodeGudang", 
      width: 100,
      align: 'center',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: "MASUK", 
      dataIndex: "QtyMasuk", 
      key: "QtyMasuk",
      align: 'right',
      render: (v) => v > 0 ? (
        <Text style={{ color: '#059669', fontWeight: '600' }}>
          <ArrowUpOutlined /> {Number(v).toLocaleString('id-ID')}
        </Text>
      ) : <Text type="secondary">-</Text>
    },
    { 
      title: "KELUAR", 
      dataIndex: "QtyKeluar", 
      key: "QtyKeluar",
      align: 'right',
      render: (v) => v > 0 ? (
        <Text style={{ color: '#dc2626', fontWeight: '600' }}>
          <ArrowDownOutlined /> {Number(v).toLocaleString('id-ID')}
        </Text>
      ) : <Text type="secondary">-</Text>
    },
    { 
      title: "REFERENSI", 
      dataIndex: "RefTransaksi", 
      key: "RefTransaksi",
      render: (text) => <Text strong style={{ color: '#1e293b' }}>{text || "-"}</Text>
    },
    { 
      title: "TIPE", 
      dataIndex: "TypeTransaksi", 
      key: "TypeTransaksi",
      align: 'center',
      render: (text) => (
        <Tag 
          color={text === 'PEMBELIAN' ? 'cyan' : 'orange'}
          style={{ borderRadius: '12px', padding: '0 10px', border: 'none' }}
        >
          {text}
        </Tag>
      )
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
              <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '12px' }}>
                <HistoryOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>Riwayat Mutasi Stok</Title>
                <Text type="secondary">Lacak keluar masuk barang antar gudang</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="small">
              <Input 
                placeholder="Cari kode barang atau ref..." 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250, borderRadius: '8px' }}
                allowClear
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadData} 
                loading={loading}
                style={{ 
                    borderRadius: '8px',
                    height: '38px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
              />
              {/* Tombol Aksi Utama yang disamakan dengan gaya komponen Barang */}
              <Button 
                type="primary" 
                icon={<HistoryOutlined />} 
                style={{ 
                  borderRadius: '8px', 
                  background: '#6366f1', 
                  height: '38px',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
                  border: 'none'
                }}
                onClick={loadData}
              >
                Refresh Data
              </Button>
            </Space>
          </Col>
        </Row>

        <Table 
          dataSource={filteredData} 
          columns={columns} 
          rowKey="IdMutasi" 
          loading={loading} 
          pagination={{ pageSize: 10 }}
          className="modern-table"
        />
      </Card>

      <style>{`
        .modern-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9 !important;
          text-transform: uppercase;
        }
        .modern-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc !important;
          padding: 14px 16px !important;
        }
        .modern-table .ant-table-tbody > tr:hover > td {
          background: #f1f5f999 !important;
        }
        .ant-btn-primary:hover {
          background: #4f46e5 !important;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default MutasiStok;