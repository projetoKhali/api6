import datetime
import os
from dotenv import load_dotenv
from sqlalchemy import (
    DateTime,
    ForeignKey,
    create_engine,
    text,
    Column,
    BigInteger,
    String,
)
from sqlalchemy.orm import sessionmaker, declarative_base


def get_keys_engine():
    load_dotenv()

    postgres_user = os.getenv("DB_KEYS_USER", "postgres")
    postgres_password = os.getenv("DB_KEYS_PASS", "secret")
    postgres_host = os.getenv("DB_KEYS_HOST", "localhost")
    postgres_port = os.getenv("DB_KEYS_PORT", "5433")
    postgres_db = os.getenv("DB_KEYS_NAME", "api6_keys")

    database_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
    return create_engine(
        database_url,
        pool_size=10,
        max_overflow=20
    )


Base = declarative_base()


class EntityType(Base):
    __tablename__ = "entity_type"
    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )
    name = Column(String, unique=True, nullable=False)


class EntityKey(Base):
    __tablename__ = "entity_key"
    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )
    entity_id = Column(
        BigInteger,
        nullable=False
    )
    key = Column(String, unique=True, nullable=False)
    entity_type = Column(
        BigInteger,
        ForeignKey("entity_type.id"),
        nullable=False
    )


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    jti = Column(String, primary_key=True)
    revoked_at = Column(
        DateTime,
        nullable=False,
        default=datetime.datetime.utcnow
    )


def create_tables(engine):
    Base.metadata.create_all(engine)


Session = sessionmaker(bind=get_keys_engine())


def test_connection(engine):
    try:
        with engine.connect() as connection:
            sql_query = "SELECT 1"
            connection.execute(text(sql_query))
    except Exception as e:
        raise Exception("Erro ao conectar ao banco de dados:", e) from e


def initialize_keys_database():
    engine = get_keys_engine()
    create_tables(engine)


if __name__ == "__main__":
    initialize_keys_database()
