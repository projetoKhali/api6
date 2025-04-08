import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, Column, Integer, String, Text, Sequence, Date
from sqlalchemy.orm import sessionmaker, declarative_base


def get_engine():
    load_dotenv()

    postgres_user = os.getenv("POSTGRES_USER", "postgres")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "secret")
    postgres_host = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port = os.getenv("POSTGRES_PORT", "5432")
    postgres_db = os.getenv("POSTGRES_DB", "postgres")

    database_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
    return create_engine(database_url, pool_size=10, max_overflow=20)


Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, Sequence("user_id_seq"), primary_key=True, column_name="usr_id", cascade="all, delete-orphan")
    name = Column(String, column_name="usr_name")
    email = Column(String, column_name="usr_email", index=True, unique=True)
    login = Column(String, column_name="usr_login", index=True, unique=True)
    password = Column(Text, column_name="usr_password")
    version_terms_agreement = Column(String, column_name="usr_version_terms_agreement")
    permission_id = Column(Integer, column_name="pm_id", foreign_key="permissions.id")
    disabled_since = Column(Date, column_name="usr_disabled_since")


class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, Sequence("permission_id_seq"), primary_key=True, column_name="pm_id")
    name = Column(String, unique=True, column_name="pm_name")
    description = Column(Text, column_name="pm_description")

class Deleted_User(Base):
    __tablename__ = "deleted_users"
    usr_id = Column(Integer, primary_key=True)

class User_key(Base):
    __tablename__ = "user_keys"
    usr_id = Column(Integer, foreign_key="users.id", primary_key=True)
    key = Column(String, unique=True)

def create_tables(engine):
    Base.metadata.create_all(engine)

Session = sessionmaker(bind=get_engine())


def test_connection(engine):
    try:
        with engine.connect() as connection:
            sql_query = "SELECT 1"
            result = connection.execute(text(sql_query))
            print("Conexão bem-sucedida", result.fetchone())
    except Exception as e:
        print("Erro ao conectar ao banco de dados:", e)


def initialize_postgres_database():
    engine = get_engine()
    test_connection(engine)
    create_tables(engine)
