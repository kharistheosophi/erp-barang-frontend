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

  // 1. FETCH HISTORY
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

  // 2. FETCH SUPPLIERS
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

  // 3. CETAK PDF
  const handlePrint = useReactToPrint({
    contentRef: invoicePrintRef,
    documentTitle: form.getFieldValue("NoFaktur") || "Invoice-Pembelian",
  });

  // 4. KLIK RIWAYAT -> TAMPILKAN DATA
  const fetchDetailFaktur = async (noFaktur) => {
    if (!noFaktur || noFaktur === "undefined") {
      message.error("Nomor Faktur tidak valid!");
      return;
    }

    try {
      const res = await API.get(`/pembelian/detail/${noFaktur}`);
      const { header, details } = res.data;

      if (!header) return message.error("Data tidak ditemukan!");

      const isArrH = Array.isArray(header);
      form.setFieldsValue({
        NoFaktur: isArrH ? header[0] : header.NoFaktur,
        TglFaktur: dayjs(isArrH ? header[1] : header.Tanggal),
        KodeSupplier: isArrH ? header[2] : header.KodeSupplier,
        Keterangan: (isArrH ? header[13] : header.Keterangan) || "",
        KodeGudang: (isArrH ? header[3] : header.KodeGudang) || "G001",
        Type: String((isArrH ? header[4] : header.Type) || "1"),
        PpnType: String((isArrH ? header[5] : header.PPnFlag) || "1"),
        TglJt: (isArrH ? header[6] : header.JatuhTempo) ? dayjs(isArrH ? header[6] : header.JatuhTempo) : null,
      });

      const mappedDetails = details.map((d, index) => {
        const isArr = Array.isArray(d);
        return {
          key: isArr ? `${d[0]}-${index}` : (d.IdDetail || index),
          KodeBrg: isArr ? d[1] : d.KodeBrg,
          NamaBrg: isArr ? d[2] : d.NamaBrg,
          Kemasan: isArr ? d[3] : d.Kemasan,
          Qty: Number(isArr ? d[4] : d.Qty),
          Harga: Number(isArr ? d[5] : d.Harga),
          Disc: Number(isArr ? d[6] : d.Disc),
          PPn: Number(isArr ? d[7] : d.PPn),
          Subtotal: Number(isArr ? d[8] : d.Subtotal),
        };
      });

      setItems(mappedDetails);
      message.success(`Faktur ${noFaktur} dimuat`);
    } catch (err) {
      console.error(err);
      message.error("Gagal memuat detail faktur");
    }
  };

  // Fungsi untuk menghitung Subtotal secara otomatis
  const calculateSubtotal = () => {
    const values = form.getFieldsValue(['tempQty', 'tempHarga', 'tempDisc']);
    const qty = values.tempQty || 0;
    const harga = values.tempHarga || 0;
    const disc = values.tempDisc || 0;

    const subtotal = (qty * harga) - disc;
    form.setFieldsValue({ tempSubtotal: subtotal });
  };

  // Fungsi untuk memasukkan data ke tabel
  const handleAddItem = () => {
    const v = form.getFieldsValue();

    if (!v.tempKode || !v.tempNama) {
      message.warning("Kode dan Nama Barang harus diisi!");
      return;
    }

    const newItem = {
      key: Date.now(),
      KodeBrg: v.tempKode,
      NamaBrg: v.tempNama,
      Qty: Number(v.tempQty || 0),
      Harga: Number(v.tempHarga || 0),
      Disc: Number(v.tempDisc || 0),
      PPn: form.getFieldValue("PpnType") === "1" ? ((v.tempSubtotal || 0) * 0.11) : 0,
      Subtotal: Number(v.tempSubtotal || 0)
    };

    setItems([...items, newItem]);

    form.setFieldsValue({
      tempKode: "",
      tempNama: "",
      tempQty: 0,
      tempHarga: 0,
      tempDisc: 0,
      tempSubtotal: 0
    });

    setTimeout(() => document.getElementById("input_tempKode")?.focus(), 100);
  };

  // 6. SAVE
  const handleSave = async () => {
    try {
      const headerValues = form.getFieldsValue();

      if (!headerValues.NoFaktur || !headerValues.KodeSupplier) {
        return message.error("No. Faktur dan Supplier wajib diisi!");
      }
      if (items.length === 0) {
        return message.error("Tambahkan minimal satu barang ke dalam tabel!");
      }

      const payload = {
        header: {
          NoFaktur: headerValues.NoFaktur,
          Tanggal: headerValues.TglFaktur ? headerValues.TglFaktur.format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss"),
          KodeSupplier: headerValues.KodeSupplier,
          KodeGudang: headerValues.KodeGudang || "G001",
          Type: headerValues.Type || "1",
          PPnFlag: headerValues.PpnType || "1",
          JatuhTempo: headerValues.TglJt ? headerValues.TglJt.format("YYYY-MM-DD") : null,
          NilaiBeli: items.reduce((a, b) => a + b.Subtotal, 0),
          NilaiDisc: items.reduce((a, b) => a + b.Disc, 0),
          NilaiPPn: items.reduce((a, b) => a + b.PPn, 0),
          Total: items.reduce((a, b) => a + (b.Subtotal + b.PPn), 0),
          UserId: "U002",
          Keterangan: headerValues.Keterangan || ""
        },
        details: items.map(item => ({
          KodeBrg: item.KodeBrg,
          Kemasan: item.Kemasan || "Pcs",
          Qty: item.Qty,
          Harga: item.Harga,
          Disc: item.Disc,
          PPn: item.PPn,
          Subtotal: item.Subtotal
        }))
      };

      const response = await API.post("/pembelian/save", payload);

      if (response.status === 201 || response.status === 200) {
        message.success("Transaksi Berhasil Disimpan ke Database!");

        setItems([]);
        form.resetFields();
        form.setFieldsValue({ TglFaktur: dayjs(), KodeGudang: 'G001', Type: '1', PpnType: '1' });

        fetchHistory();
      }
    } catch (err) {
      console.error("Detail Error:", err.response?.data || err.message);
      message.error("Gagal simpan ke database: " + (err.response?.data?.error || err.message));
    }
  };

  const columns = [
    { title: "Kode", dataIndex: "KodeBrg", key: "KodeBrg", width: 100 },
    { title: "Nama Barang", dataIndex: "NamaBrg", key: "NamaBrg", width: 220 },
    { title: "Qty", dataIndex: "Qty", key: "Qty", align: 'right', width: 70 },
    { title: "Harga", dataIndex: "Harga", key: "Harga", align: 'right', width: 120, render: v => Number(v).toLocaleString() },
    { title: "Disc", dataIndex: "Disc", key: "Disc", align: 'right', width: 100, render: v => <Text type="danger">{Number(v).toLocaleString()}</Text> },
    { title: "Subtotal", dataIndex: "Subtotal", key: "Subtotal", align: 'right', width: 130, render: v => <Text strong style={{ color: '#6366f1' }}>{Number(v).toLocaleString()}</Text> },
    {
      title: "",
      width: 50,
      align: 'center',
      fixed: 'right',
      render: (_, r) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            form.setFieldsValue({
              tempKode: r.KodeBrg,
              tempNama: r.NamaBrg,
              tempQty: r.Qty,
              tempHarga: r.Harga,
              tempDisc: r.Disc,
              tempSubtotal: r.Subtotal
            });

            setItems(items.filter(i => i.key !== r.key));

            setTimeout(() => document.getElementById("input_tempQty")?.focus(), 100);
          }}
        />
      )
    }
  ];

  return (
    // xs: form entri tampil duluan (order 1), riwayat pindah ke bawah (order 2)
    <Row gutter={[16, 16]} style={{ margin: 0, overflowX: "hidden" }}>
      {/* SIDEBAR RIWAYAT */}
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

      {/* FORM UTAMA */}
      <Col xs={24} lg={18} order={1} className="print-full-width">
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
                  <Col xs={12}>
                    <Form.Item label="Gudang" name="KodeGudang" initialValue="G001">
                      <Select
                        style={{ width: '100%' }}
                        options={[
                          { value: 'G001', label: 'G001 - Gudang Utama' },
                          { value: 'G002', label: 'G002 - Gudang Cabang' },
                          { value: 'G003', label: 'G003 - Gudang Transit' }
                        ]}
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

            {/* AREA INPUT SEJAJAR TABEL - dibuat bisa scroll horizontal & wrap di layar kecil */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #f0f0f0', 
                borderBottom: 'none', 
                padding: '8px 16px', 
                borderTopLeftRadius: '8px', 
                borderTopRightRadius: '8px',
                minWidth: 640
              }}>
                <Row gutter={[8, 8]} align="middle" className="input-row-table">
                  <Col xs={12} sm={3}>
                    <Form.Item name="tempKode" noStyle>
                      <Input 
                        id="input_tempKode" 
                        placeholder="Kode" 
                        onPressEnter={() => document.getElementById("input_tempNama")?.focus()} 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={7}>
                    <Form.Item name="tempNama" noStyle>
                      <Input 
                        id="input_tempNama" 
                        placeholder="Nama Barang (Isi Manual)" 
                        onPressEnter={() => document.getElementById("input_tempQty")?.focus()}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={2}>
                    <Form.Item name="tempQty" noStyle>
                      <InputNumber 
                        id="input_tempQty" 
                        placeholder="Qty"
                        style={{ width: '100%' }}
                        onChange={calculateSubtotal}
                        onPressEnter={() => document.getElementById("input_tempHarga")?.focus()} 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={4}>
                    <Form.Item name="tempHarga" noStyle>
                      <InputNumber 
                        id="input_tempHarga" 
                        placeholder="Harga"
                        style={{ width: '100%' }}
                        onChange={calculateSubtotal}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onPressEnter={() => document.getElementById("input_tempDisc")?.focus()} 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={3}>
                    <Form.Item name="tempDisc" noStyle>
                      <InputNumber 
                        id="input_tempDisc" 
                        placeholder="Disc"
                        style={{ width: '100%' }}
                        onChange={calculateSubtotal}
                        onPressEnter={() => document.getElementById("input_tempSubtotal")?.focus()} 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={20} sm={4}>
                    <Form.Item name="tempSubtotal" noStyle>
                      <InputNumber 
                        id="input_tempSubtotal" 
                        placeholder="Subtotal" 
                        style={{ width: '100%' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onPressEnter={handleAddItem} 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={4} sm={1}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                      style={{ width: '100%' }}
                    />
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

        {/* AREA PRINT - dibuat 0x0 + overflow hidden supaya lebar InvoicePembelianPrint 
            (biasanya didesain lebar kertas A4) tidak ikut memperlebar scrollWidth halaman */}
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
            <InvoicePembelianPrint ref={invoicePrintRef} form={form} items={items} />
          </div>
        </div>
      </Col>

      {/* MODAL SUPPLIER */}
      <Modal 
        title={<Space><SearchOutlined style={{ color: '#6366f1' }} /> <span>Pilih Supplier</span></Space>}
        open={isModalSupplierOpen} 
        onCancel={() => {
          setIsModalSupplierOpen(false);
          setSearchSupplier("");
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 700 }}
        centered
      >
        <Input
          placeholder="Cari nama atau kode supplier..."
          onChange={(e) => setSearchSupplier(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
          allowClear
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
          pagination={{ pageSize: 5 }}
          scroll={{ x: 500, y: 300 }}
          columns={[
            { title: 'Kode', width: 120, render: (_, r) => <Tag color="blue">{Array.isArray(r) ? r[0] : r.KodeSupplier}</Tag> },
            { title: 'Nama Supplier', render: (_, r) => <Text strong>{Array.isArray(r) ? r[1] : r.Nama}</Text> },
            { 
              title: 'Aksi',
              width: 100,
              align: 'center',
              render: (_, r) => (
                <Button type="primary" size="small" style={{ borderRadius: '6px', background: '#6366f1' }} onClick={() => {
                  const kode = Array.isArray(r) ? r[0] : r.KodeSupplier;
                  form.setFieldsValue({ KodeSupplier: kode });
                  setIsModalSupplierOpen(false);
                  setSearchSupplier("");
                }}>Pilih</Button>
              ) 
            },
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
      </Modal>

      <style>{`
        .history-item-hover:hover { background-color: #f5f3ff !important; }
        @media print {
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important; }
          .ant-card { border: none !important; box-shadow: none !important; }
          body { background: white !important; }
        }
        .input-row-table .ant-form-item {
          margin-bottom: 0 !important;
        }
        .input-row-table .ant-input-number, 
        .input-row-table .ant-input {
          width: 100% !important;
          border-radius: 4px;
        }
      `}</style>
    </Row>
  );
}