FROM alpine:latest
WORKDIR /

RUN apk add --no-cache chromium nodejs npm yarn

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser 

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .

RUN yarn build

CMD node build/index.js