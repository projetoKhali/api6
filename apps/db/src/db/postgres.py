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
    Table,
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import os
from dotenv import load_dotenv
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

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", BigInteger, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", BigInteger, ForeignKey("permissions.id"), primary_key=True),
)

class Role(Base):
    __tablename__ = "roles"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)

    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    users = relationship("User", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(BigInteger, Sequence("permission_id_seq"), primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=False)

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, index=True, unique=True, nullable=False)
    login = Column(String, index=True, unique=True, nullable=False)
    password = Column(Text, nullable=False)
    version_terms_agreement = Column(String)
    disabled_since = Column(Date)
    role_id = Column(BigInteger, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="users")

class AuthorizedClient(Base):
    __tablename__ = "authorized_clients"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    client_id = Column(String, index=True, unique=True, nullable=False)

class DeletedUser(Base):
    __tablename__ = "deleted_users"
    id = Column(BigInteger, primary_key=True)
    delete_date = Column(Date, default=text("now()"), nullable=False)

class UserKey(Base):
    __tablename__ = "user_key"
    id = Column(BigInteger, primary_key=True)
    key = Column(String, unique=True, nullable=False)

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    jti = Column(String, primary_key=True)
    revoked_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

def create_tables(engine):
    Base.metadata.create_all(engine)

Session = sessionmaker(bind=get_engine())

def test_connection(engine):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as e:
        raise Exception("Erro ao conectar ao banco de dados:", e) from e

def initialize_postgres_database():
    engine = get_engine()
    test_connection(engine)
    create_tables(engine)

if __name__ == "__main__":
    initialize_postgres_database()
