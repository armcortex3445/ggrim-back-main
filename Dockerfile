
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


FROM node:${NODE_VERSION}
ENV WORK_DIR="app" \
    BUILD_RESULT_PATH="/build-back/dist"

WORKDIR /${WORK_DIR}
COPY package.json package-lock.json .env.production.gpg run.sh .

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
RUN chown -R node:node /app

# node 이미지에 이미 "node"라는 사용자가 uid/gid 1000번으로 생성되어 있음
USER node

# Expose port
EXPOSE 3000


CMD ["/app/run.sh"]