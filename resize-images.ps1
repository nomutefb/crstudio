# resize-images.ps1 — 대형 이미지 웹용 축소(최대 2000px, JPEG q85) + 정현 초상 bmp→jpg 변환 + 매니페스트 재생성
$ErrorActionPreference = "Continue"
Add-Type -AssemblyName System.Drawing
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$dest = Join-Path $repo "assets\uploads\artists"

function Save-Resized([string]$path, [int]$maxDim) {
  $bytes = [IO.File]::ReadAllBytes($path)
  $ms = New-Object IO.MemoryStream(,$bytes)
  $img = [System.Drawing.Image]::FromStream($ms)
  $ratio = [Math]::Min($maxDim / $img.Width, $maxDim / $img.Height)
  if ($ratio -ge 1) { $ratio = 1 }
  $w = [Math]::Max(1, [int]($img.Width * $ratio)); $h = [Math]::Max(1, [int]($img.Height * $ratio))
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose(); $img.Dispose(); $ms.Dispose()
  $ext = [IO.Path]::GetExtension($path).ToLower()
  if ($ext -eq ".png") {
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
    $bmp.Save($path, $enc, $ep)
  }
  $bmp.Dispose()
}

# 1) 정현 초상: bmp 내려받아 jpg로 저장
$chDir = Join-Path $dest "chung-hyun"
New-Item -ItemType Directory -Force -Path $chDir | Out-Null
$tmpBmp = Join-Path $env:TEMP "chunghyun_portrait.bmp"
try {
  Invoke-WebRequest -Uri "https://www.yeulmaru.org/inday_fileinfo/img/120230315094625.bmp" -OutFile $tmpBmp -TimeoutSec 60 -UseBasicParsing
  $bytes = [IO.File]::ReadAllBytes($tmpBmp)
  $ms = New-Object IO.MemoryStream(,$bytes)
  $img = [System.Drawing.Image]::FromStream($ms)
  $out = Join-Path $chDir "portrait.jpg"
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)
  $img.Save($out, $enc, $ep)
  $img.Dispose(); $ms.Dispose()
  Remove-Item $tmpBmp -Force -ErrorAction SilentlyContinue
  Save-Resized -path $out -maxDim 2000
  Write-Host "chung-hyun portrait converted"
} catch { Write-Host "chung-hyun portrait FAIL: $($_.Exception.Message)" }

# 2) 1.5MB 초과 이미지 전체 축소
$big = Get-ChildItem $dest -Recurse -File | Where-Object { $_.Length -gt 1500000 }
Write-Host ("resizing {0} files" -f $big.Count)
foreach ($f in $big) {
  try { Save-Resized -path $f.FullName -maxDim 2000 } catch { Write-Host "RESIZE FAIL $($f.Name): $($_.Exception.Message)" }
}

# 3) 매니페스트 재생성
$manifest = New-Object System.Collections.Generic.List[string]
Get-ChildItem $dest -Directory | ForEach-Object {
  $slug = $_.Name
  Get-ChildItem $_.FullName -File | ForEach-Object {
    $manifest.Add("$slug|$($_.Name)|$($_.Length)")
  }
}
$manifest | Set-Content -Encoding utf8 (Join-Path $repo "_dl_manifest.txt")
$s = (Get-ChildItem $dest -Recurse -File | Measure-Object -Sum Length)
Write-Host ("DONE {0} files, {1:N1} MB" -f $s.Count, ($s.Sum/1MB))
