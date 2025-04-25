import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, Column, Integer, String, Text, Sequence
from sqlalchemy.orm import sessionmaker, declarative_base


def get_engine():
    load_dotenv()

    postgres_user = os.getenv("POSTGRES_USER", "postgres")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "secret")
    postgres_host = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port = os.getenv("POSTGRES_PORT", "5432")
    postgres_db = os.getenv("POSTGRES_DB", "api6_postgres")
    postgres_debug = os.getenv("POSTGRES_DEBUG", 'False').lower() in ('true', '1', 't')

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
    id = Column(Integer, Sequence("user_id_seq"), primary_key=True)
    name = Column(String)
    login = Column(String, index=True, unique=True)
    password = Column(Text)
    version_terms_agreement = Column(String)


class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, Sequence("permission_id_seq"), primary_key=True)
    name = Column(String, unique=True)
    description = Column(Text)


def create_tables(engine):
    Base.metadata.create_all(engine)


Session = sessionmaker(bind=get_engine())


def test_connection(engine):
    try:
        with engine.connect() as connection:
            sql_query = "SELECT 1"
            connection.execute(text(sql_query))
    except Exception as e:
        print("Erro ao conectar ao banco de dados:", e)


def initialize_postgres_database():
    engine = get_engine()
    test_connection(engine)
    create_tables(engine)
