import React, { useState, useEffect, useRef } from "react";
import {
  Table, Card, Typography, Row, Col, Form, Input, 
  DatePicker, Select, Button, Space, Modal, InputNumber, message, Tag
} from "antd";
import { 
  SearchOutlined, PlusOutlined, DeleteOutlined, 
  SaveOutlined, PrinterOutlined, CloseCircleOutlined, FileTextOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import API from "../services/api";

const { Title, Text } = Typography;

export default function PenjualanFaktur() {
  const [form] = Form.useForm();
  const [isModalPelangganOpen, setIsModalPelangganOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [historyFaktur, setHistoryFaktur] = useState([]);
  const [pelangganData, setPelangganData] = useState([]);
  const [gudangData, setGudangData] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchPelanggan, setSearchPelanggan] = useState("");

  useEffect(() => {
    fetchHistory();
    fetchPelanggan();
    fetchGudang();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await API.get("/penjualan/history");
      setHistoryFaktur(res.data || []);
    } catch (err) {
      message.error("Gagal memuat riwayat penjualan");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPelanggan = async () => {
    try {
      const res = await API.get("/pelanggan/");
      setPelangganData(res.data.data || []);
    } catch (err) {
      message.error("Gagal memuat data pelanggan");
    }
  };

  const fetchGudang = async () => {
    try {
      const res = await API.get("/gudang/");
      setGudangData(res.data.data || []);
    } catch (err) {
      console.error("Gagal load gudang", err);
    }
  };

  // Ambil daftar barang + stok tersedia setiap kali gudang dipilih/berubah
  const fetchBarangByGudang = async (kodeGudang) => {
    try {
      const res = await API.get(`/penjualan/barang_list?gudang=${kodeGudang}`);
      setBarangList(res.data || []);
    } catch (err) {
      message.error("Gagal memuat daftar barang");
    }
  };

  const handleGudangChange = (val) => {
    form.setFieldsValue({ KodeGudang: val });
    fetchBarangByGudang(val);
  };

  const fetchDetailFaktur = async (noFaktur) => {
    if (!noFaktur) return message.error("Nomor Faktur tidak valid!");
    try {
      const res = await API.get(`/penjualan/detail/${noFaktur}`);
      const { header, details } = res.data;
      if (!header) return message.error("Data tidak ditemukan!");

      form.setFieldsValue({
        NoFaktur: header.NoFaktur,
        TglFaktur: dayjs(header.Tanggal),
        KodePlg: header.KodePlg,
        Keterangan: header.Keterangan || "",
        KodeGudang: header.KodeGudang,
        Type: String(header.Type || "1"),
        PpnType: String(header.PPnFlag || "1"),
        TglJt: header.JatuhTempo ? dayjs(header.JatuhTempo) : null,
      });

      if (header.KodeGudang) fetchBarangByGudang(header.KodeGudang);

      const mapped = details.map((d, i) => ({
        key: d.IdDetail || i,
        KodeBrg: d.KodeBrg,
        NamaBrg: d.NamaBrg,
        Kemasan: d.Kemasan,
        Qty: Number(d.Qty),
        Harga: Number(d.Harga),
        Disc: Number(d.Disc),
        PPn: Number(d.PPn),
        Subtotal: Number(d.Subtotal),
      }));
      setItems(mapped);
      message.success(`Faktur ${noFaktur} dimuat`);
    } catch (err) {
      message.error("Gagal memuat detail faktur");
    }
  };

  const handleAddItem = () => {
    const values = form.getFieldsValue();
    if (!values.tempKode) return message.warning("Pilih barang dulu");

    const brg = barangList.find(b => String(b.KodeBrg) === String(values.tempKode));
    if (!brg) return message.error("Barang tidak ditemukan di gudang ini!");

    const qty = values.tempQty || 1;
    if (Number(brg.QtyStok || 0) < qty) {
      return message.error(`Stok tidak cukup! Tersedia: ${brg.QtyStok || 0}`);
    }

    const harga = values.tempHarga || brg.HargaJual;
    const disc = values.tempDisc || 0;
    const subtotal = qty * harga - disc;

    const newItem = {
      key: Date.now(),
      KodeBrg: brg.KodeBrg,
      NamaBrg: brg.NamaBrg,
      Kemasan: brg.Kemasan || "Pcs",
      Qty: qty,
      Harga: harga,
      Disc: disc,
      PPn: form.getFieldValue("PpnType") === "1" ? subtotal * 0.11 : 0,
      Subtotal: subtotal
    };

    setItems([...items, newItem]);
    form.setFieldsValue({ tempKode: undefined, tempQty: null, tempHarga: null, tempDisc: null });
  };

  const handleSave = async () => {
    try {
      const h = form.getFieldsValue();
      if (!h.NoFaktur || !h.KodePlg || !h.KodeGudang) {
        return message.error("Lengkapi No. Faktur, Pelanggan, dan Gudang!");
      }
      if (items.length === 0) return message.error("Tambahkan minimal 1 item barang!");

      const payload = {
        header: {
          NoFaktur: h.NoFaktur,
          Tanggal: (h.TglFaktur || dayjs()).format("YYYY-MM-DD HH:mm:ss"),
          KodePlg: h.KodePlg,
          KodeGudang: h.KodeGudang,
          Type: h.Type || "1",
          PPnFlag: h.PpnType || "1",
          JatuhTempo: h.TglJt ? h.TglJt.format("YYYY-MM-DD") : null,
          NilaiJual: items.reduce((a, b) => a + b.Subtotal, 0),
          NilaiDisc: items.reduce((a, b) => a + b.Disc, 0),
          NilaiPPn: items.reduce((a, b) => a + b.PPn, 0),
          Total: items.reduce((a, b) => a + (b.Subtotal + b.PPn), 0),
          UserId: "U002",
          Keterangan: h.Keterangan || ""
        },
        details: items
      };

      await API.post("/penjualan/save", payload);
      message.success("Transaksi penjualan berhasil disimpan, stok otomatis dikurangi");
      setItems([]);
      form.resetFields();
      fetchHistory();
    } catch (err) {
      message.error(err.response?.data?.error || "Gagal simpan transaksi");
    }
  };

  const columns = [
    { title: "Kode", dataIndex: "KodeBrg", width: 100 },
    { title: "Nama Barang", dataIndex: "NamaBrg", width: 200 },
    { title: "Qty", dataIndex: "Qty", align: 'right', width: 80 },
    { title: "Harga", dataIndex: "Harga", align: 'right', width: 110, render: v => Number(v).toLocaleString() },
    { title: "Disc", dataIndex: "Disc", align: 'right', width: 100, render: v => <Text type="danger">{Number(v).toLocaleString()}</Text> },
    { title: "Subtotal", dataIndex: "Subtotal", align: 'right', width: 130, render: v => <Text strong style={{ color: '#0d9488' }}>{Number(v).toLocaleString()}</Text> },
    {
      title: "", width: 50, align: 'center', fixed: 'right',
      render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setItems(items.filter(i => i.key !== r.key))} />
    }
  ];

  const selectedGudang = Form.useWatch("KodeGudang", form);

  return (
    <Row gutter={[16, 16]} style={{ margin: 0, overflowX: "hidden" }}>
      <Col xs={24} lg={6} order={2}>
        <Card 
          title={<Space><FileTextOutlined style={{ color: '#0d9488' }} /><Text strong>Riwayat Penjualan</Text></Space>} 
          styles={{ body: { padding: 0, maxHeight: '60vh', overflowY: 'auto' } }}
          style={{ borderRadius: '12px' }}
        >
          {loadingHistory && <div style={{ padding: 20, textAlign: 'center' }}><Text type="secondary">Memuat...</Text></div>}
          {!loadingHistory && historyFaktur.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center' }}><Text type="secondary">Belum ada riwayat penjualan</Text></div>
          )}
          {historyFaktur.map((item, i) => (
            <div key={i} onClick={() => fetchDetailFaktur(item.NoFaktur)} className="history-item-hover"
              style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <Text strong>{item.NoFaktur}</Text>
                <Tag color="green" style={{ fontSize: '10px' }}>Sold</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>{item.NamaPlg}</Text>
            </div>
          ))}
        </Card>
      </Col>

      <Col xs={24} lg={18} order={1}>
        <Card style={{ borderRadius: '12px' }} styles={{ body: { padding: '16px' } }}>
          <Form form={form} layout="vertical">
            <Row justify="space-between" align="middle" gutter={[8, 8]} style={{ marginBottom: 20 }}>
              <Col xs={24} sm="auto"><Title level={4} style={{ margin: 0 }}>Entry Penjualan Barang</Title></Col>
              <Col xs={24} sm="auto">
                <Form.Item name="NoFaktur" label="No. Faktur" style={{ margin: 0 }}>
                  <Input placeholder="NJ42681" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Row gutter={8}>
                  <Col xs={24} sm={10}><Form.Item label="Tanggal" name="TglFaktur" initialValue={dayjs()}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                  <Col xs={24} sm={14}>
                    <Form.Item label="Pelanggan" name="KodePlg">
                      <Input readOnly onClick={() => setIsModalPelangganOpen(true)} suffix={<SearchOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Notes" name="Keterangan"><Input placeholder="..." /></Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={8}>
                  <Col xs={12}>
                    <Form.Item label="Gudang" name="KodeGudang" rules={[{ required: true }]}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Pilih Gudang"
                        options={gudangData.map(g => ({ value: g.KodeGudang, label: `${g.KodeGudang} - ${g.NamaGudang}` }))}
                        onChange={handleGudangChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12}><Form.Item label="Pembayaran" name="Type" initialValue="1"><Select style={{ width: '100%' }} options={[{value: '0', label: 'Tunai'}, {value: '1', label: 'Kredit'}]} /></Form.Item></Col>
                </Row>
                <Row gutter={8}>
                  <Col xs={12}><Form.Item label="PPN" name="PpnType" initialValue="1"><Select style={{ width: '100%' }} options={[{value: '1', label: 'PPN 11%'}, {value: '0', label: 'Non PPN'}]} /></Form.Item></Col>
                  <Col xs={12}><Form.Item label="Jatuh Tempo" name="TglJt"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                </Row>
              </Col>
            </Row>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderBottom: 'none', padding: '8px 16px', borderTopLeftRadius: 8, borderTopRightRadius: 8, minWidth: 640 }}>
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={8}>
                    <Form.Item name="tempKode" noStyle>
                      <Select
                        placeholder={selectedGudang ? "Pilih Barang" : "Pilih gudang dulu"}
                        disabled={!selectedGudang}
                        showSearch
                        optionFilterProp="label"
                        style={{ width: '100%' }}
                        options={barangList.map(b => ({
                          value: b.KodeBrg,
                          label: `${b.NamaBrg} (Stok: ${b.QtyStok ?? 0})`
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={4}>
                    <Form.Item name="tempQty" noStyle>
                      <InputNumber placeholder="Qty" style={{ width: '100%' }} min={1} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={5}>
                    <Form.Item name="tempHarga" noStyle>
                      <InputNumber placeholder="Harga" style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={4}>
                    <Form.Item name="tempDisc" noStyle>
                      <InputNumber placeholder="Disc" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={3}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} style={{ width: '100%', background: '#0d9488' }}>Add</Button>
                  </Col>
                </Row>
              </div>

              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                size="small"
                scroll={{ x: 700 }}
                style={{ border: '1px solid #f0f0f0', borderTop: 'none', borderRadius: '0 0 8px 8px', minWidth: 640 }}
              />
            </div>

            <div style={{ marginTop: 24, padding: '20px', background: '#f0fdfa', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
              <Space size={40} wrap>
                <div><Text type="secondary">DPP</Text><br /><Text strong>{items.reduce((a, b) => a + b.Subtotal, 0).toLocaleString()}</Text></div>
                <div><Text type="secondary">PPN</Text><br /><Text strong>{items.reduce((a, b) => a + b.PPn, 0).toLocaleString()}</Text></div>
                <div><Text type="secondary">TOTAL</Text><br /><Text strong style={{ fontSize: 20, color: '#0d9488' }}>Rp {items.reduce((a, b) => a + (b.Subtotal + b.PPn), 0).toLocaleString()}</Text></div>
              </Space>
              <Space wrap>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ background: '#10b981' }}>Save</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => { form.resetFields(); setItems([]); }}>Reset</Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Col>

      <Modal
        title={<Space><SearchOutlined style={{ color: '#0d9488' }} /><span>Pilih Pelanggan</span></Space>}
        open={isModalPelangganOpen}
        onCancel={() => { setIsModalPelangganOpen(false); setSearchPelanggan(""); }}
        footer={null}
        width="90%"
        style={{ maxWidth: 700 }}
        centered
      >
        <Input
          placeholder="Cari nama atau kode pelanggan..."
          onChange={(e) => setSearchPelanggan(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Table
          dataSource={pelangganData.filter(p =>
            p.KodePlg?.toLowerCase().includes(searchPelanggan.toLowerCase()) ||
            p.Nama?.toLowerCase().includes(searchPelanggan.toLowerCase())
          )}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 500, y: 300 }}
          columns={[
            { title: 'Kode', width: 120, render: (_, r) => <Tag color="green">{r.KodePlg}</Tag> },
            { title: 'Nama Pelanggan', render: (_, r) => <Text strong>{r.Nama}</Text> },
            {
              title: 'Aksi', width: 100, align: 'center',
              render: (_, r) => (
                <Button type="primary" size="small" style={{ background: '#0d9488' }} onClick={() => {
                  form.setFieldsValue({ KodePlg: r.KodePlg });
                  setIsModalPelangganOpen(false);
                  setSearchPelanggan("");
                }}>Pilih</Button>
              )
            }
          ]}
          onRow={(r) => ({
            onClick: () => {
              form.setFieldsValue({ KodePlg: r.KodePlg });
              setIsModalPelangganOpen(false);
              setSearchPelanggan("");
            },
            style: { cursor: 'pointer' }
          })}
        />
      </Modal>

      <style>{`
        .history-item-hover:hover { background-color: #f0fdfa !important; }
      `}</style>
    </Row>
  );
}