$ErrorActionPreference = 'Stop'

$installUrl = 'http://localhost:8081/admin/install.php'
$checkUrl = 'http://localhost:8081/admin/check/index.php'

Write-Host 'Waiting for MantisBT to answer on /admin/check/index.php...'
for ($i = 0; $i -lt 60; $i++) {
  try {
    $response = Invoke-WebRequest -Uri $checkUrl -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

$form = @{ 
  install = '2'
  db_type = 'mysqli'
  hostname = 'mantis-db'
  db_username = 'mantisbt'
  db_password = 'mantisbt123'
  database_name = 'mantisbt'
  admin_username = 'mantisbt'
  admin_password = 'mantisbt123'
  db_table_prefix = 'mantis'
  db_table_plugin_prefix = 'plg'
  db_table_suffix = ''
  timezone = 'America/La_Paz'
  path = 'http://host.docker.internal:8081/'
  log_queries = '0'
  db_exists = '1'
  go = 'Install/Upgrade Database'
}

Write-Host 'Submitting the MantisBT installer form...'
$result = Invoke-WebRequest -Uri $installUrl -Method Post -ContentType 'application/x-www-form-urlencoded' -Body $form -UseBasicParsing

if ($result.Content -match 'Installation Complete' -or $result.Content -match 'MantisBT was installed successfully') {
  Write-Host 'MantisBT installation completed.'

  $configPath = Join-Path $PSScriptRoot 'config\config_inc.php'
  if (Test-Path $configPath) {
    $configContent = Get-Content -Path $configPath -Raw
    $configContent = $configContent -replace 'http://host\.docker\.internal:8081/', 'http://localhost:8081/'
    Set-Content -Path $configPath -Value $configContent -NoNewline
    Write-Host 'Updated MantisBT base URL to http://localhost:8081/ for browser access.'
  }
} else {
  Write-Host 'Installer response did not include the success banner; inspect the HTML below.'
}

$result.Content