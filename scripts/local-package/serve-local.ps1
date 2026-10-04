# Tiny static web server for the packaged Math Frog (Windows PowerShell 5.1+).
# Needs no Node.js and no Internet: serves the "app" folder next to this script on
# http://localhost:4173 (camera access requires https or localhost) and opens the browser.
# Messages are ASCII on purpose: PowerShell 5.1 misreads accented text in BOM-less files.
param([int]$Port = 4173, [switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'app')) + [IO.Path]::DirectorySeparatorChar
$url = "http://localhost:$Port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.wasm' = 'application/wasm'
  '.task' = 'application/octet-stream'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.ico' = 'image/x-icon'
  '.mp3' = 'audio/mpeg'
  '.wav' = 'audio/wav'
  '.woff2' = 'font/woff2'
}

# Prefer Chrome or Edge (best camera + hand-tracking support), else the default browser.
function Open-Browser([string]$target) {
  if ($NoBrowser) { return }
  $candidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($exe in $candidates) {
    if ($exe -and (Test-Path $exe)) { Start-Process $exe $target; return }
  }
  Start-Process $target
}

if (-not (Test-Path (Join-Path $root 'index.html'))) {
  Write-Host "Khong tim thay thu muc 'app' (thieu index.html). Hay giai nen lai ca file zip." -ForegroundColor Red
  Read-Host 'Nhan Enter de dong'
  exit 1
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
  $listener.Start()
} catch {
  # Port busy: Math Frog is most likely already running in another window, so reuse it.
  Write-Host "Cong $Port dang duoc dung (co the Math Frog da chay o cua so khac). Dang mo trinh duyet..." -ForegroundColor Yellow
  Open-Browser $url
  Start-Sleep -Seconds 4
  exit 0
}

Write-Host ''
Write-Host '  MATH FROG dang chay tai' $url -ForegroundColor Green
Write-Host '  Giu cua so nay MO trong luc choi. Choi xong thi dong cua so nay.'
Write-Host '  Lan dau trinh duyet hoi quyen camera: bam "Cho phep" (Allow).'
Write-Host ''
Open-Browser $url

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    # Never serve anything outside the app folder.
    if ($path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $path -PathType Leaf)) {
      $type = $mime[[IO.Path]::GetExtension($path).ToLowerInvariant()]
      if (-not $type) { $type = 'application/octet-stream' }
      $res.ContentType = $type
      $bytes = [IO.File]::ReadAllBytes($path)
    } else {
      $res.StatusCode = 404
      $res.ContentType = 'text/plain; charset=utf-8'
      $bytes = [Text.Encoding]::UTF8.GetBytes('404 - not found')
    }
    $res.Headers.Add('Cache-Control', 'no-cache')
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {
    # The browser may cancel a request mid-way; keep serving the rest.
  } finally {
    $res.Close()
  }
}
