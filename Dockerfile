
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS builder

LABEL mainainer="ggrim@back" \
      version="0.1.0" \
      description="test"

ENV BUILD_DIR="/build-back" 


#Set working directory
WORKDIR ${BUILD_DIR}

COPY . ./
RUN echo "build start: "  && pwd && ls -la
RUN npm ci && npm run build

RUN echo "comlete build: "  && pwd && ls -la
# 이미지 크기를 줄이기 위해서 어떻게 해야하는가? 빌드->빌드 결과 복사-> 빌드 실행?

# stage :: build-completor
FROM node:${NODE_VERSION} AS build-completor
ARG WORK_DIR="app" \
    BUILD_RESULT_PATH="/build-back/dist"

WORKDIR /${WORK_DIR}
COPY package.json package-lock.json .env.production.gpg *.sh .

ARG GPG_TOKEN="your_password"
RUN apk add --no-cache gnupg
RUN gpg --batch --verbose --yes --passphrase ${GPG_TOKEN} .env.production.gpg > .env.production

# Add entrypoint script and set permissions
RUN chmod +x run.sh
RUN echo "Before create image : " && pwd && ls -la

RUN npm ci --omit=dev

# Copy build artifacts from builder stage
COPY --from=builder $BUILD_RESULT_PATH ./dist/

RUN echo "complete create image : " && pwd && ls -la

# /app 디렉토리 전체에 권한 부여
RUN chown -R node:node /${WORK_DIR}

# stage : init 
FROM node:${NODE_VERSION} AS init
ARG WORK_DIR="app"



# 필요한 패키지 설치
# RUN apk update && \
#     apk add --no-cache python3 py3-pip

# # 가상 환경 생성 및 활성화
# RUN python3 -m venv /venv

# # 가상 환경 활성화 후 awscli 설치
# RUN /venv/bin/pip install awscli --upgrade

# PATH 환경 변수 설정
# ENV PATH=/venv/bin:$PATH

# AWS CLI 설치 (apk 사용)
RUN apk update && \
    apk add --no-cache aws-cli

# AWS CLI 버전 확인
RUN aws --version

#TODOconrtab 어플리케이션 설치

#디렉토리 복사
COPY --chown=node:node --from=build-completor /${WORK_DIR} /${WORK_DIR}
RUN echo "init image : " && pwd && ls -la

WORKDIR /${WORK_DIR}


# node 이미지에 이미 "node"라는 사용자가 uid/gid 1000번으로 생성되어 있음
USER node

# Expose port
EXPOSE 3000

#TODO 
#ENTRYPOINT 명령어로 변경하여 이미지 사용자 docker run에 의해 덮어쓰기 방지할것.
CMD ["sh","/app/run.sh"]