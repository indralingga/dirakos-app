'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function LengkapDataPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyWa, setEmergencyWa] = useState('');
  const [ktpFile, setKtpFile] = useState<File | null>(null);

  // Ambil nama penghuni secara otomatis untuk konfirmasi
  useEffect(() => {
    if (!id) return;
    const fetchTenant = async () => {
      try {
        const res = await fetch(`/api/penghuni/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.tenant) {
            setName(data.tenant.name);
          } else if (data?.name) {
            setName(data.name);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data penghuni:", err);
      }
    };
    fetchTenant();
  }, [id]);

  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1600;
          const maxHeight = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], cleanName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadFile = ktpFile;
      if (ktpFile) {
        uploadFile = await compressImage(ktpFile);
      }

      const formData = new FormData();
      formData.append('emergencyName', emergencyName);
      formData.append('emergencyWa', emergencyWa);
      if (uploadFile) {
        formData.append('ktpFile', uploadFile);
      }

      const res = await fetch(`/api/penghuni/${id}/lengkap-data`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        let errorMsg = 'Gagal mengirim data';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          if (res.status === 413) {
            errorMsg = 'Ukuran foto terlalu besar. Mohon pilih foto lain.';
          } else {
            errorMsg = `Gagal mengirim data (Status: ${res.status})`;
          }
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err?.message ? `Gagal mengirim data: ${err.message}` : 'Terjadi kesalahan jaringan, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Terima Kasih!</h2>
          <p style={styles.subtitle}>
            Data KTP dan Kontak Darurat Anda telah berhasil dikirim dan tersimpan di database Dira Kos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Lengkapi Data Penghuni</h2>
        <p style={styles.subtitle}>
          Halo <strong style={{color: '#0d9488'}}>{name || 'Penghuni Dira Kos'}</strong>, mohon lengkapi formulir di bawah ini untuk keperluan laporan administrasi ke pengurus RT setempat.
        </p>

        {/* Banner Kebijakan Privasi UU PDP */}
        <div style={styles.privacyNotice}>
          🔒 <strong>Informasi Privasi & Keamanan:</strong> Data KTP Anda disimpan secara aman di server pribadi <strong>Indra R. Lingga</strong> untuk keperluan pelaporan RT, dan akan <strong>dihapus secara otomatis & permanen</strong> dari server saat Anda Check-Out.
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nama Kontak Darurat (Keluarga)</label>
            <input
              type="text"
              required
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="Contoh: Ayah / Ibu / Kakak"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nomor WhatsApp Darurat</label>
            <input
              type="tel"
              required
              value={emergencyWa}
              onChange={(e) => setEmergencyWa(e.target.value)}
              placeholder="Contoh: 08123456789"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Foto KTP</label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setKtpFile(e.target.files[0]);
                }
              }}
              style={styles.fileInput}
            />
            <p style={styles.fileHint}>Pastikan foto KTP terlihat jelas dan terbaca.</p>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Mengirim...' : 'Simpan & Kirim Data'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  privacyNotice: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e3a8a',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'left' as const,
    lineHeight: '1.4',
    marginBottom: '20px',
  },
  form: {
    textAlign: 'left' as const,
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  fileInput: {
    width: '100%',
    fontSize: '14px',
  },
  fileHint: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
    color: '#059669',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    margin: '0 auto 20px',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'left' as const,
  }
};
