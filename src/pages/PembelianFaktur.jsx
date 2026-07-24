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
import { useReactToPrint } from "react-to-print";
import InvoicePembelianPrint from "./InvoicePembelianPrint";

const { Title, Text } = Typography;

export default function PembelianFaktur() {
  const [form] = Form.useForm();
  const [isModalSupplierOpen, setIsModalSupplierOpen] = useState(false);
  const [items, setItems] = useState([]); 
  const [historyFaktur, setHistoryFaktur] = useState([]); 
  const [supplierData, setSupplierData] = useState([]); 
  const [loadingHistory, setLoadingHistory] = useState(false);
  const invoicePrintRef = useRef(null);
  const [searchSupplier, setSearchSupplier] = useState("");

  useEffect(() => {
    fetchHistory();
    fetchSuppliers();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await API.get("/pembelian/history");
      setHistoryFaktur(res.data || []);
    } catch (err) {
      console.error("Gagal load history", err);
      message.error("Gagal memuat riwayat faktur. Cek koneksi ke server.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await API.get("/supplier/");
      const rawData = res.data.data || res.data;
      setSupplierData(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error("Gagal load supplier", err);
      message.error("Gagal memuat data supplier.");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: invoicePrintRef,
    documentTitle: form.getFieldValue("NoFaktur") || "Invoice-Pembelian",
  });

  const fetchDetailFaktur = async (noFaktur) => {
    if (!noFaktur || noFaktur === "undefined") {
      message.error("Nomor Faktur tidak valid!");
      return;
    }

    try {
      const res = await API.get(`/pembelian/detail/${noFaktur}`);
      const { header, details } = res.data;

      if (!header) return message.error("Data tidak ditemukan!");

      form.setFieldsValue({
        NoFaktur: header.NoFaktur,
        TglFaktur: dayjs(header.Tanggal),
        KodeSupplier: header.KodeSupplier,
        Keterangan: header.Keterangan || "",
        KodeGudang: header.KodeGudang || "G101",
        Type: String(header.Type || "1"),
        PpnType: String(header.PPnFlag || "1"),
        TglJt: header.JatuhTempo ? dayjs(header.JatuhTempo) : null,
      });

      const mappedDetails = details.map((d, index) => ({
        key: d.IdDetail || index,
        KodeBrg: d.KodeBrg,
        NamaBrg: d.NamaBrg,
        Kemasan: d.Kemasan,
        Qty: Number(d.Qty),
        Harga: Number(d.Harga),
        Disc: Number(d.Disc),
        PPn: Number(d.PPn),
        Subtotal: Number(d.Subtotal),
      }));

      setItems(mappedDetails);
      message.success(`Faktur ${noFaktur} dimuat`);
    } catch (err) {
      console.error(err);
      message.error("Gagal memuat detail faktur");
    }
  };

  const handleAddItem = async () => {
    const values = form.getFieldsValue();
    if (!values.tempKode) return message.warning("Masukkan Kode Barang");

    try {
      const res = await API.get("/pembelian/barang_list");
      const daftarBarang = res.data;

      const brg = daftarBarang.find(b => String(b.KodeBrg) === String(values.tempKode));

      if (!brg) return message.error("Barang tidak ditemukan!");

      form.setFieldsValue({ tempNama: brg.NamaBrg });

      const newItem = {
        key: Date.now(),
        KodeBrg: brg.KodeBrg,
        NamaBrg: brg.NamaBrg,
        Kemasan: brg.Kemasan || "Pcs",
        Qty: values.tempQty || 1,
        Harga: values.tempHarga || brg.HargaBeli,
        Disc: values.tempDisc || 0,
        PPn: 0,
        Subtotal: (values.tempQty || 1) * (values.tempHarga || brg.HargaBeli) - (values.tempDisc || 0)
      };

      setItems([...items, newItem]);

      form.setFieldsValue({
        tempKode: "",
        tempNama: "",
        tempQty: null,
        tempHarga: null,
        tempDisc: null,
      });
    } catch (err) {
      console.error(err);
      message.error("Gagal mengambil data barang");
    }
  };

  const handleSave = async () => {
    try {
      const headerValues = form.getFieldsValue();
      if (!headerValues.NoFaktur || !headerValues.KodeSupplier) {
        return message.error("Lengkapi data!");
      }
      if (items.length === 0) {
        return message.error("Tambahkan minimal 1 item barang!");
      }

      const payload = {
        header: {
          ...headerValues,
          Tanggal: headerValues.TglFaktur?.format("YYYY-MM-DD HH:mm:ss"),
          PPnFlag: headerValues.PpnType,
          JatuhTempo: headerValues.TglJt?.format("YYYY-MM-DD"),
          NilaiBeli: items.reduce((a, b) => a + b.Subtotal, 0),
          NilaiDisc: items.reduce((a, b) => a + b.Disc, 0),
          NilaiPPn: items.reduce((a, b) => a + b.PPn, 0),
          Total: items.reduce((a, b) => a + (b.Subtotal + b.PPn), 0),
          UserId: "U002"
        },
        details: items
      };

      await API.post("/pembelian/save", payload);
      message.success("Berhasil Simpan");
      setItems([]);
      form.resetFields();
      fetchHistory();
    } catch (err) {
      console.error(err);
      message.error("Gagal simpan transaksi");
    }
  };

  const columns = [
    { title: "Kode", dataIndex: "KodeBrg", key: "KodeBrg", width: 100 },
    { title: "Nama Barang", dataIndex: "NamaBrg", key: "NamaBrg", width: 180 },
    { title: "Qty", dataIndex: "Qty", key: "Qty", align: 'right', width: 80 },
    { title: "Nilai", dataIndex: "Harga", key: "Harga", align: 'right', width: 110, render: v => Number(v).toLocaleString() },
    { title: "Disc", dataIndex: "Disc", key: "Disc", align: 'right', width: 100, render: v => <Text type="danger">{Number(v).toLocaleString()}</Text> },
    { title: "Subtotal", dataIndex: "Subtotal", key: "Subtotal", align: 'right', width: 130, render: v => <Text strong style={{ color: '#6366f1' }}>{Number(v).toLocaleString()}</Text> },
    {
      title: "", width: 50, align: 'center', fixed: 'right',
      render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setItems(items.filter(i => i.key !== r.key))} />
    }
  ];

  return (
    <Row gutter={[16, 16]} style={{ margin: 0, overflowX: "hidden" }}>
      <Col xs={24} lg={6} order={2} className="no-print">
        <Card 
          title={<Space><FileTextOutlined style={{ color: '#6366f1' }} /> <Text strong>Riwayat Faktur</Text></Space>} 
          styles={{ body: { padding: 0, maxHeight: '60vh', overflowY: 'auto' } }}
          style={{ borderRadius: '12px' }}
        >
          {loadingHistory && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Text type="secondary">Memuat...</Text>
            </div>
          )}
          {!loadingHistory && historyFaktur.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Text type="secondary">Belum ada riwayat faktur</Text>
            </div>
          )}
          {historyFaktur.map((item, index) => {
             const isArray = Array.isArray(item);
             const fakturID = isArray ? item[0] : (item.NoFaktur || item.nofaktur);
             const suppName = isArray ? item[2] : (item.NamaSupp || "Unknown");
             return (
              <div key={index} onClick={() => fetchDetailFaktur(fakturID)} className="history-item-hover"
                style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                  <Text strong>{fakturID}</Text>
                  <Tag color="blue" style={{ fontSize: '10px' }}>Purchased</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>{suppName}</Text>
              </div>
            );
          })}
        </Card>
      </Col>

      <Col xs={24} lg={18} order={1} className="print-full-width">
        <div>
          <Card style={{ borderRadius: '12px' }} styles={{ body: { padding: '16px' } }}>
            <Form form={form} layout="vertical">
              <Row justify="space-between" align="middle" gutter={[8, 8]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm="auto"><Title level={4} style={{ margin: 0 }}>Entry Pembelian Barang</Title></Col>
                <Col xs={24} sm="auto">
                  <Form.Item name="NoFaktur" label="No. Faktur" style={{ margin: 0 }}>
                    <Input placeholder="NB42681" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Row gutter={8}>
                    <Col xs={24} sm={10}><Form.Item label="Tanggal" name="TglFaktur" initialValue={dayjs()}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                    <Col xs={24} sm={14}>
                      <Form.Item label="Supplier" name="KodeSupplier">
                        <Input readOnly onClick={() => setIsModalSupplierOpen(true)} suffix={<SearchOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Notes" name="Keterangan"><Input placeholder="..." /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Row gutter={8}>
                    <Col xs={12}><Form.Item label="Gudang" name="KodeGudang" initialValue="G101"><Select style={{ width: '100%' }} options={[{value: 'G101', label: 'G101 - Pusat'}]} /></Form.Item></Col>
                    <Col xs={12}><Form.Item label="Pembayaran" name="Type" initialValue="1"><Select style={{ width: '100%' }} options={[{value: '0', label: 'Tunai'}, {value: '1', label: 'Kredit'}]} /></Form.Item></Col>
                  </Row>
                  <Row gutter={8}>
                    <Col xs={12}><Form.Item label="PPN" name="PpnType" initialValue="1"><Select style={{ width: '100%' }} options={[{value: '1', label: 'PPN 11%'}, {value: '0', label: 'Non PPN'}]} /></Form.Item></Col>
                    <Col xs={12}><Form.Item label="Jatuh Tempo" name="TglJt"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                  </Row>
                </Col>
              </Row>

              <div style={{ overflowX: "auto" }}>
                <Table 
                  columns={columns} dataSource={items} pagination={false} size="small"
                  scroll={{ x: 750 }}
                  summary={() => (
                    <Table.Summary.Row className="no-print" style={{ background: '#f8fafc' }}>
                      <Table.Summary.Cell index={0}><Form.Item name="tempKode" noStyle><Input placeholder="Kode" variant="borderless" /></Form.Item></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}><Text type="secondary">Input barang...</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={2}><Form.Item name="tempQty" noStyle><InputNumber placeholder="0" variant="borderless" style={{ width: '100%' }} /></Form.Item></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}><Form.Item name="tempHarga" noStyle><InputNumber placeholder="0" variant="borderless" style={{ width: '100%' }} /></Form.Item></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}><Form.Item name="tempDisc" noStyle><InputNumber placeholder="0" variant="borderless" style={{ width: '100%' }} /></Form.Item></Table.Summary.Cell>
                      <Table.Summary.Cell index={5} colSpan={2}><Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddItem}>Add</Button></Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </div>

              <div style={{ marginTop: 24, padding: '20px', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
                <Space size={40} wrap>
                  <div><Text type="secondary">DPP</Text><br /><Text strong>{items.reduce((a, b) => a + b.Subtotal, 0).toLocaleString()}</Text></div>
                  <div><Text type="secondary">PPN</Text><br /><Text strong>{items.reduce((a, b) => a + b.PPn, 0).toLocaleString()}</Text></div>
                  <div><Text type="secondary">TOTAL</Text><br /><Text strong style={{ fontSize: '20px', color: '#6366f1' }}>Rp {items.reduce((a, b) => a + (b.Subtotal + b.PPn), 0).toLocaleString()}</Text></div>
                </Space>
                <Space className="no-print" wrap>
                  <Button icon={<PrinterOutlined />} onClick={handlePrint}>Print PDF</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ background: '#10b981' }}>Save</Button>
                  <Button danger icon={<CloseCircleOutlined />} onClick={() => {form.resetFields(); setItems([]);}}>Reset</Button>
                </Space>
              </div>
            </Form>
          </Card>

          {/* FIX: wrapper dibuat 0x0 + overflow hidden supaya lebar InvoicePembelianPrint 
              (biasanya didesain lebar kertas A4) tidak ikut memperlebar scrollWidth halaman. */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            pointerEvents: "none"
          }}>
            <div style={{ visibility: "hidden" }}>
              <InvoicePembelianPrint
                ref={invoicePrintRef}
                form={form}
                items={items}
              />
            </div>
          </div>
        </div>
      </Col>

      <Modal 
        title={
          <Space>
            <SearchOutlined style={{ color: '#6366f1' }} />
            <span>Pilih Supplier</span>
          </Space>
        }
        open={isModalSupplierOpen} 
        onCancel={() => {
          setIsModalSupplierOpen(false);
          setSearchSupplier("");
        }} 
        footer={null}
        width="90%"
        style={{ maxWidth: 700 }}
        centered
        styles={{ body: { paddingTop: '10px' } }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="Cari nama atau kode supplier..."
            prefix={<SearchOutlined type="secondary" />}
            onChange={(e) => setSearchSupplier(e.target.value)}
            allowClear
            size="large"
            style={{ borderRadius: '8px' }}
          />

          <Table 
            dataSource={supplierData.filter(s => {
              const kode = Array.isArray(s) ? s[0] : s.KodeSupplier;
              const nama = Array.isArray(s) ? s[1] : s.Nama;
              return (
                kode?.toLowerCase().includes(searchSupplier.toLowerCase()) ||
                nama?.toLowerCase().includes(searchSupplier.toLowerCase())
              );
            })} 
            size="middle"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 500, y: 300 }}
            columns={[
              { 
                title: 'Kode', 
                width: 120,
                render: (_, r) => <Tag color="blue">{Array.isArray(r) ? r[0] : r.KodeSupplier}</Tag> 
              },
              { 
                title: 'Nama Supplier', 
                render: (_, r) => <Text strong>{Array.isArray(r) ? r[1] : r.Nama}</Text> 
              },
              {
                title: 'Aksi',
                key: 'action',
                width: 100,
                align: 'center',
                render: (_, r) => (
                  <Button 
                    type="primary" 
                    size="small"
                    style={{ borderRadius: '6px', background: '#6366f1' }}
                    onClick={() => {
                      const kode = Array.isArray(r) ? r[0] : r.KodeSupplier;
                      form.setFieldsValue({ KodeSupplier: kode });
                      setIsModalSupplierOpen(false);
                      setSearchSupplier("");
                    }}
                  >
                    Pilih
                  </Button>
                ),
              }
            ]}
            onRow={(r) => ({
              onClick: () => {
                const kode = Array.isArray(r) ? r[0] : r.KodeSupplier;
                form.setFieldsValue({ KodeSupplier: kode });
                setIsModalSupplierOpen(false);
                setSearchSupplier("");
              },
              style: { cursor: 'pointer' }
            })}
          />
        </Space>
      </Modal>

      <style>{`
        .history-item-hover:hover { background-color: #f5f3ff !important; }
        
        @media print {
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important; }
          .ant-card { border: none !important; box-shadow: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </Row>
  );
}