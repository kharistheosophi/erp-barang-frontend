import React, { forwardRef } from "react";
import dayjs from "dayjs";

const InvoicePembelianPrint = forwardRef(({ form, items }, ref) => {
  // 1. Ambil data Header dari Form
  // Menggunakan optional chaining (?.) untuk menghindari error jika form belum terisi
  const values = form?.getFieldsValue?.() || {};

  // 2. Fungsi Terbilang (Mengubah Angka jadi Kata - Bahasa Indonesia)
  const kekata = (n) => {
    const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let temp = "";
    if (n < 12) {
      temp = " " + angka[n];
    } else if (n < 20) {
      temp = kekata(n - 10) + " Belas";
    } else if (n < 100) {
      temp = kekata(Math.floor(n / 10)) + " Puluh" + kekata(n % 10);
    } else if (n < 200) {
      temp = " Seratus" + kekata(n - 100);
    } else if (n < 1000) {
      temp = kekata(Math.floor(n / 100)) + " Ratus" + kekata(n % 100);
    } else if (n < 2000) {
      temp = " Seribu" + kekata(n - 1000);
    } else if (n < 1000000) {
      temp = kekata(Math.floor(n / 1000)) + " Ribu" + kekata(n % 1000);
    } else if (n < 1000000000) {
      temp = kekata(Math.floor(n / 1000000)) + " Juta" + kekata(n % 1000000);
    }
    return temp;
  };

  const terbilang = (nilai) => {
    if (nilai < 0) return "Minus " + kekata(Math.abs(nilai));
    return kekata(nilai);
  };

  // 3. Hitung Total (DPP, PPN, Grand Total)
  // Menggunakan reduce pada array 'items' yang dilempar dari parent
  const totalSubtotal = items.reduce((a, b) => a + (Number(b.Subtotal) || 0), 0);
  const totalPPn = items.reduce((a, b) => a + (Number(b.PPn) || 0), 0);
  // Grand Total = DPP + PPN
  const grandTotal = totalSubtotal + totalPPn;

  // Style untuk garis putus-putus atau double line sesuai gaya faktur lama
  const styles = {
    container: {
      padding: "40px 30px",
      fontFamily: "'Courier New', Courier, monospace", // Font struk/dot matrix
      fontSize: "12px",
      color: "#000",
      backgroundColor: "#fff",
      width: "100%",
    },
    headerTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      textTransform: "uppercase",
      textAlign: "right"
    },
    lineDouble: {
      borderBottom: "3px double #000",
      marginBottom: "10px",
      paddingBottom: "10px"
    },
    lineSolid: {
      borderBottom: "1px solid #000"
    },
    tableHeader: {
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      padding: "5px 0",
      fontWeight: "bold",
      textTransform: "uppercase"
    }
  };

  return (
    <div ref={ref} style={styles.container}>
      
      {/* --- HEADER PERUSAHAAN & JUDUL FAKTUR --- */}
      <div style={{ display: "flex", justifyContent: "space-between", ...styles.lineDouble }}>
        <div>
          <strong style={{ fontSize: "16px" }}>CV REJEKI JAYA TEKNIK</strong><br />
          Komplek Pertokoan Sumur Bandung - Metro<br />
          Telp: (021) 555-7777 / Fax: -
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={styles.headerTitle}>FAKTUR PEMBELIAN</div>
          <div>No. Faktur: <strong>{values.NoFaktur || "......."}</strong></div>
          <div>Gudang: {values.KodeGudang || "G101"} - Gudang Utama</div>
        </div>
      </div>

      {/* --- INFORMASI SUPPLIER & TANGGAL --- */}
      <table style={{ width: "100%", marginBottom: "15px", fontSize: "12px" }}>
        <tbody>
          <tr>
            <td style={{ width: "10%" }}>Supplier</td>
            <td style={{ width: "50%" }}>: <strong>{values.KodeSupplier}</strong> {values.NamaSupplier ? `- ${values.NamaSupplier}` : ""}</td>
            <td style={{ width: "15%", textAlign: "right" }}>Tanggal :</td>
            <td style={{ width: "25%", textAlign: "right" }}>{values.TglFaktur ? dayjs(values.TglFaktur).format("DD/MM/YYYY") : "-"}</td>
          </tr>
          <tr>
            <td>Alamat</td>
            <td>: {values.AlamatSupplier || "-"}</td> 
            <td style={{ textAlign: "right" }}>Jatuh Tempo :</td>
            <td style={{ textAlign: "right" }}>{values.TglJt ? dayjs(values.TglJt).format("DD/MM/YYYY") : "-"}</td>
          </tr>
          <tr>
            <td>Notes</td>
            <td>: {values.Keterangan}</td>
            <td style={{ textAlign: "right" }}>Syarat Bayar :</td>
            <td style={{ textAlign: "right" }}>{values.Type === "1" ? "Kredit (Term)" : "Tunai (Cash)"}</td>
          </tr>
        </tbody>
      </table>

      {/* --- TABEL ITEM BARANG --- */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={{ textAlign: "left", width: "15%" }}>KODE</th>
            <th style={{ textAlign: "left" }}>NAMA BARANG</th>
            <th style={{ textAlign: "center", width: "10%" }}>KEMASAN</th>
            <th style={{ textAlign: "right", width: "8%" }}>QTY</th>
            <th style={{ textAlign: "right", width: "15%" }}>HARGA</th>
            <th style={{ textAlign: "right", width: "10%" }}>DISC</th>
            <th style={{ textAlign: "right", width: "18%" }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ verticalAlign: "top" }}>
              <td style={{ padding: "4px 0" }}>{item.KodeBrg}</td>
              <td style={{ padding: "4px 0" }}>{item.NamaBrg}</td>
              <td style={{ padding: "4px 0", textAlign: "center" }}>{item.Kemasan}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{Number(item.Qty).toLocaleString()}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{Number(item.Harga).toLocaleString()}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{Number(item.Disc).toLocaleString()}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{Number(item.Subtotal).toLocaleString()}</td>
            </tr>
          ))}
          
          {/* Baris kosong pelengkap (Opsional, agar kertas tidak terlalu pendek) */}
          {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
             <tr key={`empty-${i}`}><td colSpan={7} style={{ padding: "10px" }}>&nbsp;</td></tr>
          ))}
        </tbody>
      </table>
      
      {/* Garis Penutup Tabel */}
      <div style={{ borderTop: "1px solid #000", marginBottom: "5px" }}></div>

      {/* --- FOOTER: TOTAL & TERBILANG --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        
        {/* Kiri: Terbilang */}
        <div style={{ width: "60%", paddingRight: "20px" }}>
          <div style={{ border: "1px solid #000", padding: "8px", fontStyle: "italic", background: "#f9f9f9" }}>
            <strong>Terbilang:</strong> # {terbilang(grandTotal)} Rupiah #
          </div>
          <div style={{ marginTop: "5px", fontSize: "11px" }}>
            * Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.<br/>
            * Pembayaran via Transfer BCA: 123-456-7890 a/n CV Rejeki Jaya.
          </div>
        </div>

        {/* Kanan: Angka Total */}
        <div style={{ width: "35%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
             <span>DPP (Dasar Pengenaan Pajak)</span>
             <span>{totalSubtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
             <span>PPN (11%)</span>
             <span>{totalPPn.toLocaleString()}</span>
          </div>
          <div style={{ borderTop: "1px solid #000", margin: "5px 0" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold" }}>
             <span>GRAND TOTAL</span>
             <span>Rp {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* --- TANDA TANGAN --- */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", textAlign: "center" }}>
        <div style={{ width: "20%" }}>
          <p>Admin,</p>
          <br /><br /><br /><br />
          ( ....................... )
        </div>
        <div style={{ width: "20%" }}>
          <p>Bag. Gudang,</p>
          <br /><br /><br /><br />
          ( ....................... )
        </div>
        <div style={{ width: "20%" }}>
          <p>Pengirim,</p>
          <br /><br /><br /><br />
          ( ....................... )
        </div>
        <div style={{ width: "20%" }}>
          <p>Diterima Oleh,</p>
          <br /><br /><br /><br />
          ( ....................... )
        </div>
      </div>

      {/* Footer System Info */}
      <div style={{ marginTop: "30px", fontSize: "10px", fontStyle: "italic", borderTop: "1px dashed #ccc", paddingTop: "5px", display: "flex", justifyContent: "space-between" }}>
        <span>Created by: System ERP ({dayjs().format("DD/MM/YYYY HH:mm")})</span>
        <span>Page 1 of 1</span>
      </div>

    </div>
  );
});

export default InvoicePembelianPrint;