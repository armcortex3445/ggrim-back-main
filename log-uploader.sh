#!/bin/bash

# S3 버킷 이름 설정
BUCKET_NAME="ggrim-log-collector"
BUCKET_PATH="log/backend"

# AWS CLI 경로를 포함한 PATH 설정
export PATH=$PATH:/usr/local/bin

# 하루 전 날짜 계산 (윤년 고려)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USER_HOME="$HOME"

# 로그 파일 경로 설정 (복수의 디렉터리를 포함)
LOG_DIRS=("${SCRIPT_DIR}/logs/typeorm" "${SCRIPT_DIR}/logs/app") # 필요한 디렉토리를 추가

# 쉘스크립트 로그 파일 설정
SH_LOG_PATH="${SCRIPT_DIR}/my-cron-job/cron.log"

# 로그 디렉토리 생성 (없으면 생성)
mkdir -p "$(dirname ${SH_LOG_PATH})"

# 업로드 성공 및 실패 카운터 초기화
SUCCESS_COUNT=0
FAIL_COUNT=0

echo "[$(date)] - Starting log upload" >> "${SH_LOG_PATH}"


# 디렉토리별로 처리
for DIR in "${LOG_DIRS[@]}"; do
    echo "[$(date)] Processing directory: ${DIR}" >> "${SH_LOG_PATH}"

    # 대상 파일 리스트 생성
    FILES=$(find "${DIR}" -type f -name "${YESTERDAY}.*.log*")

    # 파일이 없으면 로그에 기록하고 넘어감
    if [ -z "${FILES}" ]; then
        echo "[$(date)] No files found in ${DIR} for ${YESTERDAY}" >> "${SH_LOG_PATH}"
        continue
    fi

    # 파일 개별 업로드
    for FILE in ${FILES}; do
        aws s3 cp "${FILE}" "s3://${BUCKET_NAME}/${BUCKET_PATH}/" >> "${SH_LOG_PATH}"

        # 업로드 결과 확인
        if [ $? -eq 0 ]; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            echo "[$(date)] Uploaded: ${FILE}" >> "${SH_LOG_PATH}"
        else
            FAIL_COUNT=$((FAIL_COUNT + 1))
            echo "[$(date)] Failed to upload: ${FILE}" >> "${SH_LOG_PATH}"
        fi
    done
done

# 업로드 요약 로그
echo "[$(date)] Total successful uploads: ${SUCCESS_COUNT}" >> "${SH_LOG_PATH}"
echo "[$(date)] Total failed uploads: ${FAIL_COUNT}" >> "${SH_LOG_PATH}"

echo "[$(date)] - Finished log upload" >> "${SH_LOG_PATH}"
