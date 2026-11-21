@echo off
cd /d "%~dp0"

echo Indexation des disques en cours...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0indexer.ps1"

:: Service local pour ouvrir les fichiers/dossiers avec le programme par defaut Windows
start "" /min powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
  "$l = New-Object System.Net.HttpListener; $l.Prefixes.Add('http://127.0.0.1:45678/'); $l.Start();" ^
  "while ($l.IsListening) { $c = $l.GetContext(); $p = [System.Web.HttpUtility]::UrlDecode($c.Request.QueryString['path']); if ($p -and (Test-Path $p)) { Start-Process -FilePath $p }; $c.Response.Headers.Add('Access-Control-Allow-Origin','*'); $c.Response.Close() }"

:: Surveillance automatique du branchement / retrait de disques (HDD / USB)
start "" /min powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
  "$prev = (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match '^[A-Z]:\\$' } | Select-Object -ExpandProperty Root) -join ',';" ^
  "while ($true) { Start-Sleep -Seconds 3; $curr = (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match '^[A-Z]:\\$' } | Select-Object -ExpandProperty Root) -join ','; if ($curr -ne $prev) { $prev = $curr; & '%~dp0indexer.ps1' } }"

start "" "%~dp0Everything-Standalone.html"
