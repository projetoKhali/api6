FROM alpine:latest

RUN apk add --no-cache \
    lua \
    lua \
    lua-socket \
    lua-cjson \
    curl \
    && ln -s /usr/bin/lua5.4 /usr/bin/lua

WORKDIR /app
COPY hydra_bootstrap.lua .

CMD ["lua", "hydra_bootstrap.lua"]
