#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USER_HOME="$HOME"

# 크론 작업을 위한 크론 파일 설정
CRON_FILE="/etc/cron.d/log-upload-cron"

# S3 버킷과 로그 업로드 스크립트 경로 설정
LOG_UPLOADER_SCRIPT="${SCRIPT_DIR}/log-uploader.sh"
CRON_LOG_PATH="${SCRIPT_DIR}/my-cron-job/cron.log"

# AWS 자격 증명 파일 설정
# Q. /home/jihwan 경로는 환경에 의존하므로, 독립적으로 동작하도록 해야한다.
AWS_CREDENTIALS_DIR="${USER_HOME}/.aws"
AWS_CREDENTIALS_FILE="$AWS_CREDENTIALS_DIR/credentials"

# 자격 증명 파일에서 AWS Access Key와 Secret Key 읽기
AWS_CREDENTIALS_INFO_FILE="${SCRIPT_DIR}/aws_credential_info"

if [[ ! -f "$AWS_CREDENTIALS_INFO_FILE" ]]; then
  echo "Error: AWS credentials file not found at $AWS_CREDENTIALS_INFO_FILE"
  exit 1
fi

AWS_ACCESS_KEY_ID=$(grep -i "aws_access_key_id" "$AWS_CREDENTIALS_INFO_FILE" | awk -F' = ' '{print $2}')
AWS_SECRET_ACCESS_KEY=$(grep -i "aws_secret_access_key" "$AWS_CREDENTIALS_INFO_FILE" | awk -F' = ' '{print $2}')

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
  echo "Error: Unable to extract AWS credentials from $AWS_CREDENTIALS_INFO_FILE"
  exit 1
fi

# AWS 자격 증명 디렉토리 및 파일 생성
mkdir -p $AWS_CREDENTIALS_DIR

# AWS 자격 증명 파일에 입력된 Access Key와 Secret Key를 설정
echo "[default]" > $AWS_CREDENTIALS_FILE
echo "aws_access_key_id = $AWS_ACCESS_KEY_ID" >> $AWS_CREDENTIALS_FILE
echo "aws_secret_access_key = $AWS_SECRET_ACCESS_KEY" >> $AWS_CREDENTIALS_FILE

# 크론 파일에 cron 작업 추가
echo "*/5 * * * * root export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID && export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY && $LOG_UPLOADER_SCRIPT >> $CRON_LOG_PATH 2>&1" > $CRON_FILE

# 크론 파일 권한 설정
chmod 0644 $CRON_FILE

# cron 서비스 재시작
service cron restart

# 결과 출력
echo "AWS credentials have been set and cron job has been added for log uploader script."
