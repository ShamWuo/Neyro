param(
  [string]$HostUrl = "http://localhost:3000"
)

Write-Host "Starting HTTP E2E test against $HostUrl"

try {
  $body = @{ filename = "test.jpg"; contentType = "image/jpeg" } | ConvertTo-Json
  Write-Host "Requesting presign..."
  $presign = Invoke-RestMethod -Uri "$HostUrl/api/uploads/presign" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
  Write-Host "PRESIGN:" ($presign | ConvertTo-Json -Depth 5)

  if ($presign.mock) { $uploadUrl = "$HostUrl$($presign.url)" } else { $uploadUrl = $presign.url }
  Write-Host "UPLOAD_URL: $uploadUrl"

  Write-Host "Uploading test payload via PUT..."
  $bytes = [System.Text.Encoding]::UTF8.GetBytes("test-upload-content")
  $putResponse = Invoke-WebRequest -Uri $uploadUrl -Method PUT -Body $bytes -UseBasicParsing -ErrorAction Stop
  Write-Host "PUT_STATUS: $($putResponse.StatusCode)"
} catch {
  Write-Host "ERROR during presign/put:" $_.Exception.Message
  exit 1
}

try {
  Write-Host "Calling /api/dev/assist-test with imageUrl..."
  $form = @{ text = "Smoke test from run_http_e2e.ps1"; imageUrl = $uploadUrl }
  $assist = Invoke-RestMethod -Uri "$HostUrl/api/dev/assist-test" -Method POST -Form $form -ErrorAction Stop
  Write-Host "ASSIST_RESPONSE:" ($assist | ConvertTo-Json -Depth 5)
} catch {
  Write-Host "ERROR during assist-test:" $_.Exception.Message
  exit 1
}

Write-Host "E2E HTTP test completed successfully."