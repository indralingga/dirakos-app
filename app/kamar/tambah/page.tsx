import AddRoomForm from '@/app/components/AddRoomForm';

export default function TambahKamarPage() {
  return (
    <div>
      <h1 className="page-title">Tambah Kamar Baru</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
        Silakan isi data untuk kamar kosan yang baru dibangun.
      </p>
      
      <AddRoomForm />
    </div>
  );
}
