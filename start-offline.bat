@echo off
REM Chay "Toan Van Dong" tren may nay, KHONG can Internet.
REM Lan dau (khi con mang): chay "npm install" mot lan de tai thu vien.
cd /d "%~dp0"
if not exist node_modules (
  echo Chua cai thu vien. Hay ket noi mang va chay: npm install
  pause
  exit /b 1
)
call npm run offline
