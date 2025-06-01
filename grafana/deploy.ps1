# Fly.io CLI가 설치되어 있는지 확인
if (!(Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "Fly.io CLI가 설치되어 있지 않습니다. 설치를 진행합니다..."
    iwr https://fly.io/install.ps1 -useb | iex
}

# Fly.io에 로그인되어 있는지 확인
flyctl auth whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fly.io에 로그인이 필요합니다..."
    flyctl auth login
}

# 애플리케이션 생성 (이미 존재하는 경우 건너뜀)
flyctl apps create voice-monitor-grafana --json

# 시크릿 설정
flyctl secrets set GF_SECURITY_ADMIN_PASSWORD="your-secure-password-here"

# 배포
flyctl deploy 