import React, { useState, useEffect } from 'react';

function App() {
  // ---------------------------------------------------------------------------
  // 1. WAKTU REAL-TIME
  // ---------------------------------------------------------------------------
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDateTime.toLocaleTimeString('id-ID');

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATION (LOGIN & LOGOUT)
  // ---------------------------------------------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('MY_KASIR_AUTH') === 'true'
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput === 'admin' && passwordInput === '1234') {
      setIsLoggedIn(true);
      sessionStorage.setItem('MY_KASIR_AUTH', 'true');
      setUsernameInput('');
      setPasswordInput('');
    } else {
      alert('Username atau Password salah! (Gunakan: admin / 1234)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('MY_KASIR_AUTH');
  };

  // ---------------------------------------------------------------------------
  // 3. STATE MASTER BARANG & LOCAL STORAGE
  // ---------------------------------------------------------------------------
  const [masterBarang, setMasterBarang] = useState(() => {
    const savedData = localStorage.getItem('MY_KASIR_STOK');
    return savedData
      ? JSON.parse(savedData)
      : [
          { id: 'BRG-001', nama: 'Buku Tulis', hargaBeli: 3000, hargaJual: 5000, stokAwal: 10, isArchived: false },
          { id: 'BRG-002', nama: 'Pensil 2B', hargaBeli: 1500, hargaJual: 3000, stokAwal: 15, isArchived: false },
          { id: 'BRG-003', nama: 'Penghapus', hargaBeli: 900, hargaJual: 1000, stokAwal: 3, isArchived: false },
        ];
  });

  const [riwayatTransaksi, setRiwayatTransaksi] = useState(() => {
    const savedTx = localStorage.getItem('MY_KASIR_TRANSAKSI');
    return savedTx ? JSON.parse(savedTx) : [];
  });

  // State Form Input & Pencarian
  const [nama, setNama] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [stokInput, setStokInput] = useState('');
  const [selectedBarangId, setSelectedBarangId] = useState('');
  const [jumlahJual, setJumlahJual] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // SINKRONISASI LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('MY_KASIR_STOK', JSON.stringify(masterBarang));
  }, [masterBarang]);

  useEffect(() => {
    localStorage.setItem('MY_KASIR_TRANSAKSI', JSON.stringify(riwayatTransaksi));
  }, [riwayatTransaksi]);

  // ---------------------------------------------------------------------------
  // 4. HANDLER FITUR BARANG & TRANSAKSI
  // ---------------------------------------------------------------------------
  // Tambah Master Barang Baru
  const handleSubmitBarang = (e) => {
    e.preventDefault();
    if (!nama || !hargaBeli || !hargaJual || stokInput === '') {
      return alert('Mohon isi semua data barang!');
    }

    const stokNum = Number(stokInput);
    const barangBaru = {
      id: `BRG-00${masterBarang.length + 1}`,
      nama,
      hargaBeli: Number(hargaBeli),
      hargaJual: Number(hargaJual),
      stokAwal: stokNum,
      isArchived: stokNum === 0,
    };

    setMasterBarang([...masterBarang, barangBaru]);
    setNama('');
    setHargaBeli('');
    setHargaJual('');
    setStokInput('');
  };

  // Tambah Stok (Restok Barang)
  const handleRestokBarang = (id) => {
    const tambahStok = prompt('Masukkan jumlah stok yang ingin ditambahkan:');
    if (tambahStok !== null && !isNaN(tambahStok) && Number(tambahStok) > 0) {
      const qtyTambah = Number(tambahStok);
      setMasterBarang(
        masterBarang.map((b) => {
          if (b.id === id) {
            const stokBaru = b.stokAwal + qtyTambah;
            return {
              ...b,
              stokAwal: stokBaru,
              isArchived: stokBaru === 0, // Otomatis aktif kembali jika stok > 0
            };
          }
          return b;
        })
      );
    }
  };

  // Proses Transaksi Penjualan
  const handleProsesTransaksi = (e) => {
    e.preventDefault();
    const barangTarget = masterBarang.find((b) => b.id === selectedBarangId);

    if (!barangTarget) return alert('Pilih barang terlebih dahulu!');
    if (Number(jumlahJual) <= 0) return alert('Jumlah jual tidak valid!');
    if (barangTarget.stokAwal < Number(jumlahJual)) return alert('Stok barang tidak mencukupi!');

    const qty = Number(jumlahJual);
    const totalHargaJual = qty * barangTarget.hargaJual;
    const totalHargaBeli = qty * barangTarget.hargaBeli;
    const keuntungan = totalHargaJual - totalHargaBeli;

    const now = new Date();
    const txBaru = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      namaBarang: barangTarget.nama,
      jumlah: qty,
      totalHarga: totalHargaJual,
      laba: keuntungan,
      tanggal: now.toISOString().split('T')[0],
      tanggalTampil: now.toLocaleDateString('id-ID'),
      bulan: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      tahun: `${now.getFullYear()}`,
      waktu: now.toLocaleTimeString('id-ID'),
    };

    setRiwayatTransaksi([txBaru, ...riwayatTransaksi]);

    // Potong Stok Otomatis
    setMasterBarang(
      masterBarang.map((b) => {
        if (b.id === selectedBarangId) {
          const sisaStok = b.stokAwal - qty;
          return { ...b, stokAwal: sisaStok, isArchived: sisaStok === 0 };
        }
        return b;
      })
    );

    setSelectedBarangId('');
    setJumlahJual('');
  };

  const handleHapusBarang = (id) => {
    if (window.confirm('Yakin ingin menghapus barang ini secara permanen?')) {
      setMasterBarang(masterBarang.filter((b) => b.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setMasterBarang(
      masterBarang.map((b) => (b.id === id ? { ...b, isArchived: !b.isArchived } : b))
    );
  };

  // ---------------------------------------------------------------------------
  // 5. KALKULASI LABA & FILTER DATA
  // ---------------------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const thisYearStr = `${new Date().getFullYear()}`;

  const labaHarian = riwayatTransaksi.filter((tx) => tx.tanggal === todayStr).reduce((sum, tx) => sum + (tx.laba || 0), 0);
  const labaBulanan = riwayatTransaksi.filter((tx) => tx.bulan === thisMonthStr).reduce((sum, tx) => sum + (tx.laba || 0), 0);
  const labaTahunan = riwayatTransaksi.filter((tx) => tx.tahun === thisYearStr).reduce((sum, tx) => sum + (tx.laba || 0), 0);

  const barangTerfilter = masterBarang.filter((b) =>
    b.nama.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  const barangAktif = barangTerfilter.filter((b) => !b.isArchived);
  const barangNonaktif = barangTerfilter.filter((b) => b.isArchived);

  // ---------------------------------------------------------------------------
  // 6. TAMPILAN 1: HALAMAN LOGIN / LANDING PAGE
  // ---------------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#1e272e', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏬 Selamat Datang di My Kasir</h1>
          <p style={{ color: '#00d2d3', fontSize: '1.1rem' }}>Sistem Point of Sales (POS) & Manajemen Stok Barang Real-Time</p>
        </div>

        <div style={{ backgroundColor: '#2d3436', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '360px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>🔐 Login Kasir</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #555', boxSizing: 'border-box', backgroundColor: '#1e272e', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #555', boxSizing: 'border-box', backgroundColor: '#1e272e', color: '#fff' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#10ac84', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
              Masuk Sistem
            </button>
          </form>

          {/* KOTAK INFORMASI AKUN DEMO */}
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#1e272e', borderRadius: '6px', borderLeft: '4px solid #00d2d3', fontSize: '12px', color: '#ccc', textAlign: 'left' }}>
            <strong>💡 Account Demo (Reviewer):</strong><br />
            Username: <code style={{ color: '#00d2d3' }}>admin</code> | Password: <code style={{ color: '#00d2d3' }}>1234</code>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 7. TAMPILAN 2: DASHBOARD UTAMA
  // ---------------------------------------------------------------------------
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '950px', margin: '0 auto', color: '#fff' }}>
      
      {/* HEADER UTAMA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>🛒 My Kasir</h1>
          <p style={{ margin: '5px 0 0 0', color: '#00d2d3', fontWeight: 'bold' }}>
            📅 {formattedDate} | ⏰ {formattedTime} WIB
          </p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#ee5253', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          🔒 Logout
        </button>
      </div>

      {/* DASHBOARD LABA RUGI */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={{ flex: 1, backgroundColor: '#2c3e50', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📅 Laba Hari Ini</h4>
          <h3 style={{ margin: 0, color: '#10ac84' }}>Rp {labaHarian.toLocaleString()}</h3>
        </div>
        <div style={{ flex: 1, backgroundColor: '#2c3e50', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📆 Laba Bulan Ini</h4>
          <h3 style={{ margin: 0, color: '#2e86de' }}>Rp {labaBulanan.toLocaleString()}</h3>
        </div>
        <div style={{ flex: 1, backgroundColor: '#2c3e50', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📊 Laba Tahun Ini</h4>
          <h3 style={{ margin: 0, color: '#fabca1' }}>Rp {labaTahunan.toLocaleString()}</h3>
        </div>
      </div>

      {/* PENCARIAN BARANG */}
      <input
        type="text"
        placeholder="🔍 Cari nama barang..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', fontSize: '16px', boxSizing: 'border-box' }}
      />

      {/* FORM TRANSAKSI */}
      <h2>💸 Transaksi Penjualan</h2>
      <form onSubmit={handleProsesTransaksi} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <select value={selectedBarangId} onChange={(e) => setSelectedBarangId(e.target.value)} style={{ padding: '8px' }}>
          <option value="">-- Pilih Barang --</option>
          {barangAktif.map((b) => (
            <option key={b.id} value={b.id}>{b.nama} (Stok: {b.stokAwal})</option>
          ))}
        </select>
        <input type="number" placeholder="Jumlah Jual" value={jumlahJual} onChange={(e) => setJumlahJual(e.target.value)} />
        <button type="submit" style={{ backgroundColor: '#10ac84', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold' }}>
          Proses Transaksi
        </button>
      </form>

      {/* FORM TAMBAH MASTER BARANG */}
      <h2>📦 Form Tambah Master Barang</h2>
      <form onSubmit={handleSubmitBarang} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Nama Barang" value={nama} onChange={(e) => setNama(e.target.value)} />
        <input type="number" placeholder="Harga Beli (Rp)" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} />
        <input type="number" placeholder="Harga Jual (Rp)" value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} />
        <input type="number" placeholder="Stok Awal" value={stokInput} onChange={(e) => setStokInput(e.target.value)} />
        <button type="submit" style={{ cursor: 'pointer' }}>Tambah Barang</button>
      </form>

      {/* TABEL BARANG AKTIF */}
      <h2>📋 Daftar Barang Aktif ({barangAktif.length})</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
            <th>Kode</th><th>Nama</th><th>Harga Beli</th><th>Harga Jual</th><th>Stok</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {barangAktif.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada barang aktif</td></tr>
          ) : (
            barangAktif.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.nama}</td>
                <td>Rp {b.hargaBeli.toLocaleString()}</td>
                <td>Rp {b.hargaJual.toLocaleString()}</td>
                <td>{b.stokAwal}</td>
                <td>
                  <button onClick={() => handleRestokBarang(b.id)} style={{ backgroundColor: '#2e86de', color: '#fff', border: 'none', padding: '5px 8px', cursor: 'pointer', marginRight: '5px' }}>+ Stok</button>
                  <button onClick={() => handleHapusBarang(b.id)} style={{ backgroundColor: '#ee5253', color: '#fff', border: 'none', padding: '5px 8px', cursor: 'pointer' }}>Hapus</button>
                  <button onClick={() => handleToggleStatus(b.id)} style={{ backgroundColor: '#ff9f43', color: '#fff', border: 'none', padding: '5px 8px', marginLeft: '5px', cursor: 'pointer' }}>Nonaktifkan</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* TABEL BARANG NONAKTIF / HABIS */}
      <h2>🗃️ Daftar Barang Nonaktif / Habis ({barangNonaktif.length})</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
            <th>Kode</th><th>Nama</th><th>Stok</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {barangNonaktif.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada barang nonaktif</td></tr>
          ) : (
            barangNonaktif.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.nama}</td>
                <td>{b.stokAwal}</td>
                <td>
                  <button onClick={() => handleRestokBarang(b.id)} style={{ backgroundColor: '#2e86de', color: '#fff', border: 'none', padding: '5px 8px', cursor: 'pointer', marginRight: '5px' }}>+ Restok</button>
                  <button onClick={() => handleHapusBarang(b.id)} style={{ backgroundColor: '#ee5253', color: '#fff', border: 'none', padding: '5px 8px', cursor: 'pointer' }}>Hapus</button>
                  <button onClick={() => handleToggleStatus(b.id)} style={{ backgroundColor: '#10ac84', color: '#fff', border: 'none', padding: '5px 8px', marginLeft: '5px', cursor: 'pointer' }}>Aktifkan</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* TABEL RIWAYAT TRANSAKSI */}
      <h2>🧾 Riwayat Transaksi & Keuntungan</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
            <th>ID Transaksi</th><th>Nama Barang</th><th>Jumlah</th><th>Total Harga</th><th>Laba</th><th>Tanggal</th><th>Jam</th>
          </tr>
        </thead>
        <tbody>
          {riwayatTransaksi.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Belum ada transaksi</td></tr>
          ) : (
            riwayatTransaksi.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.namaBarang}</td>
                <td>{tx.jumlah}</td>
                <td>Rp {tx.totalHarga.toLocaleString()}</td>
                <td style={{ color: '#10ac84' }}>+Rp {tx.laba ? tx.laba.toLocaleString() : 0}</td>
                <td>{tx.tanggalTampil || tx.tanggal}</td>
                <td>{tx.waktu}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;