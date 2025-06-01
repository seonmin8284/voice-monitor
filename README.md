# Voice Monitor 프로젝트

## 시스템 요구사항

- Docker
- Docker Compose
- Node.js
- npm 또는 yarn

## 실행 방법

### 1. 도커 컨테이너 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
# 도커 컨테이너 실행
docker-compose up -d
```

이 명령어는 다음 서비스들을 실행합니다:

- Zookeeper (포트: 2181)
- Kafka (포트: 9092, 7071)
- Spark (포트: 8082, 8090)
- Prometheus (포트: 9090)
- Grafana (포트: 3000)
- Airflow Webserver (포트: 8081)
- Airflow Scheduler
- Airflow Postgres (포트: 5432)
- Monitor Service (포트: 8000, 9101)

### 2. 웹 애플리케이션 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 서비스 접속 정보

### Grafana 대시보드

- URL: http://localhost:3000
- 접속 방식: 익명 로그인 (Anonymous Access)
- 권한: Admin

### Prometheus

- URL: http://localhost:9090

### Airflow

- URL: http://localhost:8081
- 사용자: airflow
- 비밀번호: airflow

### Monitor Service

- URL: http://localhost:8000
- Metrics Endpoint: http://localhost:9101/metrics

## 주의사항

1. Grafana는 익명 로그인이 활성화되어 있어 별도의 로그인 없이 접속 가능합니다.
2. 이 설정은 개발 환경을 위한 것으로, 프로덕션 환경에서는 적절한 보안 설정이 필요합니다.
3. 모든 서비스가 정상적으로 시작되기까지 약간의 시간이 소요될 수 있습니다.

## 문제 해결

서비스 실행 중 문제가 발생할 경우:

```bash
# 도커 컨테이너 상태 확인
docker-compose ps

# 도커 컨테이너 로그 확인
docker-compose logs [서비스명]

# 모든 컨테이너 재시작
docker-compose down
docker-compose up -d
```
