$ErrorActionPreference = "SilentlyContinue"
$outFile = Join-Path $PSScriptRoot "index-pc.js"
$tmpFile = Join-Path $PSScriptRoot "index-pc.tmp.js"

$excludeRootC = @('inetpub', 'Intel', 'PerfLogs', 'Program Files', 'Program Files (x86)', 'Programmes', 'Programmes (x86)', 'Windows', '$Recycle.Bin', 'System Volume Information', 'DumpStack.log.tmp')
$drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match '^[A-Z]:\\$' }

$sw = New-Object System.IO.StreamWriter($tmpFile, $false, [System.Text.Encoding]::UTF8)
$sw.Write("window.PC_INDEX=[")
$first = $true

function Write-Item($item) {
    $name = $item.Name.Replace('\', '\\').Replace('"', '\"')
    $dir  = if ($item.DirectoryName) { $item.DirectoryName.Replace('\', '\\').Replace('"', '\"') } else { "" }
    $full = $item.FullName.Replace('\', '\\').Replace('"', '\"')
    $isDir = if ($item.PSIsContainer) { "true" } else { "false" }
    $size = if ($item.PSIsContainer) { 0 } else { $item.Length }
    $mtime = ([DateTimeOffset]$item.LastWriteTimeUtc).ToUnixTimeMilliseconds()
    $ext = if ($item.PSIsContainer) { "" } else { $item.Extension.TrimStart('.').ToLower().Replace('"', '\"') }

    if (-not $script:first) { $sw.Write(",") }
    $script:first = $false
    $sw.Write("{`"name`":`"$name`",`"path`":`"$dir`",`"fullPath`":`"$full`",`"isDir`":$isDir,`"size`":$size,`"mtime`":$mtime,`"ext`":`"$ext`"}")
}

foreach ($d in $drives) {
    if ($d.Root -eq 'C:\') {
        $topItems = Get-ChildItem -Path 'C:\' -Force -ErrorAction SilentlyContinue | Where-Object { $excludeRootC -notcontains $_.Name }
        foreach ($top in $topItems) {
            Write-Item $top
            if ($top.PSIsContainer) {
                Get-ChildItem -Path $top.FullName -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Item $_ }
            }
        }
    } else {
        Get-ChildItem -Path $d.Root -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Item $_ }
    }
}

$sw.Write("];")
$sw.Close()
Move-Item -Path $tmpFile -Destination $outFile -Force
