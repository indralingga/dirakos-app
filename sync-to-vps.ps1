$SSH_KEY = "D:\Program\Server Oracle\ssh-key-dirasystem.key"
$VPS_USER = "ubuntu"
$VPS_IP = "167.234.220.85"
$LOCAL_AUTH = "D:\Program\BACKUP KOSAN\dirakos\.wwebjs_auth"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 SINKRONISASI SESI WHATSAPP KE VPS DIRAKOS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path $LOCAL_AUTH)) {
    Write-Host "❌ Error: Folder sesi $LOCAL_AUTH belum ada. Silakan jalankan pair-whatsapp.bat terlebih dahulu!" -ForegroundColor Red
    exit 1
}

Write-Host "1. Menghentikan PM2 dirakos-app di VPS..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "pm2 stop dirakos-app && rm -rf /home/ubuntu/dirakos/.wwebjs_auth"

Write-Host "2. Mengupload folder sesi ke VPS..." -ForegroundColor Yellow
scp -r -i $SSH_KEY -o StrictHostKeyChecking=no "$LOCAL_AUTH" "$VPS_USER@${VPS_IP}:/home/ubuntu/dirakos/"

Write-Host "3. Memulai kembali PM2 dirakos-app di VPS..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "pm2 start dirakos-app"

Write-Host "4. Menunggu inisialisasi WA (10 detik)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "5. Cek Status WhatsApp di VPS..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "curl -s http://localhost:3000/api/wa/status"

Write-Host "`n✅ SELESAI! Silakan cek web https://dirakos.indralingga.my.id/wa" -ForegroundColor Green
