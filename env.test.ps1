param(
    [switch]$Offline
)

$ErrorActionPreference = "Stop"

function Read-EnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing env file: $Path"
    }

    $values = @{}

    foreach ($rawLine in Get-Content -LiteralPath $Path) {
        $line = $rawLine.Trim()

        if (-not $line -or $line.StartsWith("#")) {
            continue
        }

        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            continue
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        $values[$key] = $value
    }

    return $values
}

function Add-Result {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Status,
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $script:Results += [pscustomobject]@{
        Status  = $Status
        Name    = $Name
        Message = $Message
    }
}

function Test-Placeholder {
    param(
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $true
    }

    $lower = $Value.ToLowerInvariant()
    return (
        $lower.Contains("your-project.supabase.co") -or
        $lower.Contains("your_supabase_anon_key") -or
        $lower.Contains("changeme") -or
        $lower.Contains("example.com")
    )
}

function Test-HttpUrl {
    param(
        [string]$Value
    )

    return $Value -match '^https?://'
}

$script:Results = @()
$root = $PSScriptRoot
$backendEnvPath = Join-Path $root "backend/.env"
$webEnvPath = Join-Path $root "web/.env"

$backendEnv = Read-EnvFile -Path $backendEnvPath
$webEnv = Read-EnvFile -Path $webEnvPath

Add-Result -Status "PASS" -Name "backend/.env" -Message "Loaded backend env file."
Add-Result -Status "PASS" -Name "web/.env" -Message "Loaded web env file."

$geminiApiKey = $backendEnv["GEMINI_API_KEY"]
$geminiModel = $backendEnv["GEMINI_MODEL"]

if ([string]::IsNullOrWhiteSpace($geminiApiKey)) {
    Add-Result -Status "FAIL" -Name "GEMINI_API_KEY" -Message "Missing backend GEMINI_API_KEY."
} elseif ($geminiApiKey -notmatch '^AIza[0-9A-Za-z\-_]{20,}$') {
    Add-Result -Status "WARN" -Name "GEMINI_API_KEY" -Message "Key is present but does not match the usual Google API key format."
} else {
    Add-Result -Status "PASS" -Name "GEMINI_API_KEY" -Message "Backend Gemini API key is set."
}

if ([string]::IsNullOrWhiteSpace($geminiModel)) {
    $geminiModel = "gemma-4-31b-it"
    Add-Result -Status "WARN" -Name "GEMINI_MODEL" -Message "Missing GEMINI_MODEL. Falling back to $geminiModel."
} else {
    Add-Result -Status "PASS" -Name "GEMINI_MODEL" -Message "Using model $geminiModel."
}

$apiBaseUrl = $webEnv["NEXT_PUBLIC_API_BASE_URL"]
if ([string]::IsNullOrWhiteSpace($apiBaseUrl)) {
    Add-Result -Status "FAIL" -Name "NEXT_PUBLIC_API_BASE_URL" -Message "Missing frontend API base URL."
} elseif (-not (Test-HttpUrl -Value $apiBaseUrl)) {
    Add-Result -Status "FAIL" -Name "NEXT_PUBLIC_API_BASE_URL" -Message "Frontend API base URL must start with http:// or https://."
} else {
    Add-Result -Status "PASS" -Name "NEXT_PUBLIC_API_BASE_URL" -Message "Frontend API base URL is $apiBaseUrl."
}

$supabaseUrl = $webEnv["NEXT_PUBLIC_SUPABASE_URL"]
if (Test-Placeholder -Value $supabaseUrl) {
    Add-Result -Status "WARN" -Name "NEXT_PUBLIC_SUPABASE_URL" -Message "Supabase URL is missing or still a placeholder."
} else {
    Add-Result -Status "PASS" -Name "NEXT_PUBLIC_SUPABASE_URL" -Message "Supabase URL is configured."
}

$supabaseAnonKey = $webEnv["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
if (Test-Placeholder -Value $supabaseAnonKey) {
    Add-Result -Status "WARN" -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Message "Supabase anon key is missing or still a placeholder."
} else {
    Add-Result -Status "PASS" -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Message "Supabase anon key is configured."
}

if (-not $Offline -and -not [string]::IsNullOrWhiteSpace($geminiApiKey)) {
    $bodyObject = @{
        contents = @(
            @{
                parts = @(
                    @{
                        text = "Explain how AI works in a few words"
                    }
                )
            }
        )
    }
    $body = $bodyObject | ConvertTo-Json -Depth 6
    $tempBodyPath = Join-Path $root ".env.test.request.json"

    $liveTestPassed = $false
    $lastLiveError = $null

    try {
        $body | Set-Content -LiteralPath $tempBodyPath -NoNewline

        foreach ($attempt in 1..2) {
            try {
                $rawResponse = & curl.exe -sS -X POST "https://generativelanguage.googleapis.com/v1beta/models/$geminiModel`:generateContent" -H "Content-Type: application/json" -H "x-goog-api-key: $geminiApiKey" --data-binary "@$tempBodyPath"
                if ($LASTEXITCODE -ne 0) {
                    throw "curl.exe exited with code $LASTEXITCODE."
                }

                $response = $rawResponse | ConvertFrom-Json
                if ($response.error) {
                    $errorCode = [int]$response.error.code
                    $errorStatus = $response.error.status
                    $errorMessage = $response.error.message
                    throw "API error $errorCode ($errorStatus): $errorMessage"
                }

                $text = $null
                $candidates = @($response.candidates)
                if ($candidates.Count -gt 0) {
                    foreach ($part in @($candidates[0].content.parts)) {
                        if (-not $part.thought -and $part.text) {
                            $text = $part.text
                            break
                        }
                    }
                }

                if ([string]::IsNullOrWhiteSpace($text)) {
                    $text = "Model responded, but no plain text part was extracted."
                }

                Add-Result -Status "PASS" -Name "Gemini Live API" -Message "Live generation succeeded with $geminiModel on attempt $attempt. Sample: $text"
                $liveTestPassed = $true
                break
            } catch {
                $lastLiveError = $_.Exception.Message
                if ($attempt -lt 2) {
                    Start-Sleep -Seconds 2
                }
            }
        }
    } finally {
        Remove-Item -LiteralPath $tempBodyPath -ErrorAction SilentlyContinue
    }

    if (-not $liveTestPassed) {
        Add-Result -Status "FAIL" -Name "Gemini Live API" -Message $lastLiveError
    }
} elseif ($Offline) {
    Add-Result -Status "WARN" -Name "Gemini Live API" -Message "Skipped live API test because -Offline was used."
}

foreach ($result in $Results) {
    Write-Host "[$($result.Status)] $($result.Name): $($result.Message)"
}

$failCount = @($Results | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = @($Results | Where-Object { $_.Status -eq "WARN" }).Count
$passCount = @($Results | Where-Object { $_.Status -eq "PASS" }).Count

Write-Host ""
Write-Host "Summary: $passCount passed, $warnCount warnings, $failCount failed."

if ($failCount -gt 0) {
    exit 1
}
