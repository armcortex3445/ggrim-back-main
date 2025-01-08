
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
ENV WORK_DIR="/app" \
    BUILD_RESULT_PATH="/build-back/dist"

WORKDIR /${WORK_DIR}
COPY ./package.json package-lock.json .env.production run.sh .
RUN chmod +x /app/run.sh
RUN echo "Before create image : " && pwd && ls -la

RUN npm ci

COPY --from=builder $BUILD_RESULT_PATH $WORK_DIR/dist
RUN echo "complete create image : " && pwd && ls -la


EXPOSE 3000


CMD ["/app/run.sh"]