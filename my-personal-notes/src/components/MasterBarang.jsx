import React, { useState } from 'react';

function MasterBarang() {
  // State untuk menyimpan daftar semua barang
  const [masterBarang, setMasterBarang] = useState([
    { id: 'BRG-001', nama: 'Buku Tulis', hargaBeli: 3000, hargaJual: 5000, stokAwal: 10 },
    { id: 'BRG-002', nama: 'Pensil 2B', hargaBeli: 1500, hargaJual: 3000, stokAwal: 20 },
  ]);

  // State untuk form input
  const [nama, setNama] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [stokAwal, setStokAwal] = useState('');

  // Handler saat tombol "Tambah Barang" diklik
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nama || !hargaBeli || !hargaJual || !stokAwal) {
      alert('Semua data barang wajib diisi!');
      return;
    }

    const barangBaru = {
      id: `BRG-00${masterBarang.length + 1}`,
      nama: nama,
      hargaBeli: Number(hargaBeli),
      hargaJual: Number(hargaJual),
      stokAwal: Number(stokAwal),
    };

    setMasterBarang([...masterBarang, barangBaru]);

    // Reset input form setelah submit
    setNama('');
    setHargaBeli('');
    setHargaJual('');
    setStokAwal('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>📦 My Kasir - Master Barang</h2>

      {/* FORM INPUT BARANG */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nama Barang"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <input
          type="number"
          placeholder="Harga Beli (Rp)"
          value={hargaBeli}
          onChange={(e) => setHargaBeli(e.target.value)}
        />
        <input
          type="number"
          placeholder="Harga Jual (Rp)"
          value={hargaJual}
          onChange={(e) => setHargaJual(e.target.value)}
        />
        <input
          type="number"
          placeholder="Stok Awal"
          value={stokAwal}
          onChange={(e) => setStokAwal(e.target.value)}
        />
        <button type="submit">Tambah Barang</button>
      </form>

      {/* TABEL DAFTAR BARANG */}
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>Kode Barang</th>
            <th>Nama Barang</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Stok Awal</th>
          </tr>
        </thead>
        <tbody>
          {masterBarang.map((barang) => (
            <tr key={barang.id}>
              <td>{barang.id}</td>
              <td>{barang.nama}</td>
              <td>Rp {barang.hargaBeli.toLocaleString()}</td>
              <td>Rp {barang.hargaJual.toLocaleString()}</td>
              <td>{barang.stokAwal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MasterBarang;