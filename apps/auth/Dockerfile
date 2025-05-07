FROM rust:latest AS builder

WORKDIR /usr/src/auth

COPY apps/auth/Cargo.toml Cargo.lock ./
COPY apps/auth/src ./src
COPY .env ./

# Create the environment file inside the container with needed variables
RUN set -o allexport \
      && . /usr/src/auth/.env \
      && set +o allexport \
      && mkdir -p /app \
      && echo "DB_POSTGRES_USER=$DB_POSTGRES_USER" >> /app/.env \
      && echo "DB_POSTGRES_PASS=$DB_POSTGRES_PASS" >> /app/.env \
      && echo "DB_POSTGRES_HOST=$DB_POSTGRES_HOST" >> /app/.env \
      && echo "DB_POSTGRES_PORT=$DB_POSTGRES_PORT" >> /app/.env \
      && echo "DB_POSTGRES_NAME=$DB_POSTGRES_NAME" >> /app/.env \
      && echo "AUTH_JWT_SECRET=$AUTH_JWT_SECRET" >> /app/.env \
      && echo "AUTH_DEV_MODE=$AUTH_DEV_MODE" >> /app/.env \
      && echo "AUTH_PORT=$AUTH_PORT" >> /app/.env

RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app

# Install only runtime dependencies for Actix (e.g., OpenSSL)
RUN apt-get update && \
    apt-get install -y libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/* :contentReference[oaicite:4]{index=4}

# copy everything from builder
# COPY --from=builder /usr/src/auth/ /usr/src/auth/

# Copy the compiled binary from builder
COPY --from=builder /usr/src/auth/target/release/auth   /usr/local/bin/auth
COPY --from=builder /app/.env                           .env

EXPOSE 3000

CMD ["auth"]
