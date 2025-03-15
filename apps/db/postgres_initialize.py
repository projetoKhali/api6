import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, Column, Integer, String, Text, Sequence
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "secret")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

def get_engine():
    return create_engine(DATABASE_URL, pool_size=10, max_overflow=20)

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    name = Column(String)
    login = Column(String, index=True, unique=True)
    password = Column(Text)

class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, Sequence('permission_id_seq'), primary_key=True)
    name = Column(String, unique=True)
    description = Column(Text)

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

if __name__ == "__main__":
    engine = get_engine()
    create_tables(engine)
    test_connection(engine)
