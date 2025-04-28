import os
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    text,
    Column,
    BigInteger,
    String,
    Text,
    Sequence,
    ForeignKey,
    Date,
    DateTime,
)
from sqlalchemy.orm import sessionmaker, declarative_base
import datetime


def get_engine():
    load_dotenv()

    postgres_user = os.getenv("DB_POSTGRES_USER", "postgres")
    postgres_password = os.getenv("DB_POSTGRES_PASS", "secret")
    postgres_host = os.getenv("DB_POSTGRES_HOST", "localhost")
    postgres_port = os.getenv("DB_POSTGRES_PORT", "5432")
    postgres_db = os.getenv("DB_POSTGRES_NAME", "api6_postgres")
    postgres_debug = os.getenv(
        "DB_POSTGRES_DEBUG", 'False').lower() in ('true', '1', 't')

    database_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
    return create_engine(
        database_url,
        echo=postgres_debug,
        pool_size=10,
        max_overflow=20
    )


Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True,
                autoincrement=True, name="usr_id")
    name = Column(String, name="usr_name")
    email = Column(String, name="usr_email", index=True, unique=True)
    login = Column(String, name="usr_login", index=True, unique=True)
    password = Column(Text, name="usr_password")
    version_terms_agreement = Column(
        String, name="usr_version_terms_agreement")
    disabled_since = Column(Date, name="usr_disabled_since")

    permission_id = Column(BigInteger, ForeignKey(
        "permissions.pm_id"), name="pm_id")


class Permission(Base):
    __tablename__ = "permissions"
    id = Column(BigInteger, Sequence("permission_id_seq"),
                primary_key=True, name="pm_id")
    name = Column(String, unique=True, name="pm_name")
    description = Column(Text, name="pm_description")


class DeletedUser(Base):
    __tablename__ = "deleted_users"
    usr_id = Column(BigInteger, primary_key=True, name="usr_id")
    delete_date = Column(Date, name="delete_date", default=text("now()"))


class UserKey(Base):
    __tablename__ = "user_key"
    usr_id = Column(
        BigInteger,
        primary_key=True
    )
    key = Column(String, unique=True)


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


Session = sessionmaker(bind=get_engine())


def test_connection(engine):
    try:
        with engine.connect() as connection:
            sql_query = "SELECT 1"
            connection.execute(text(sql_query))
    except Exception as e:
        raise Exception("Erro ao conectar ao banco de dados:", e) from e


def initialize_postgres_database():
    engine = get_engine()
    test_connection(engine)
    create_tables(engine)


if __name__ == "__main__":
    initialize_postgres_database()
