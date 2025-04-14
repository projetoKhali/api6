import os
from dotenv import load_dotenv
from sqlalchemy import ForeignKey, create_engine, text, Column, Integer, String, Text, Sequence, Date
from sqlalchemy.orm import sessionmaker, declarative_base

def get_engine():
    load_dotenv()

    postgres_user = os.getenv("POSTGRES_USER", "postgres")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "secret")
    postgres_host = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port = os.getenv("POSTGRES_PORT", "5432")
    postgres_db = os.getenv("POSTGRES_DB", "api6_postgres")

    database_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
    return create_engine(database_url, pool_size=10, max_overflow=20)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, Sequence("user_id_seq"), primary_key=True, name="usr_id")
    name = Column(String, name="usr_name")
    email = Column(String, name="usr_email", index=True, unique=True)
    login = Column(String, name="usr_login", index=True, unique=True)
    password = Column(Text, name="usr_password")
    version_terms_agreement = Column(String, name="usr_version_terms_agreement")
    permission_id = Column(Integer, ForeignKey("permissions.pm_id"), name="pm_id")
    disabled_since = Column(Date, name="usr_disabled_since")

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, Sequence("permission_id_seq"), primary_key=True, name="pm_id")
    name = Column(String, unique=True, name="pm_name")
    description = Column(Text, name="pm_description")

class Deleted_User(Base):
    __tablename__ = "deleted_users"
    usr_id = Column(Integer, primary_key=True, name="usr_id")
    delete_date = Column(Date, name="delete_date", default=text("now()"))

class User_Key(Base):
    __tablename__ = "user_key"
    usr_id = Column(
        Integer,
        primary_key=True
    )
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

if __name__ == "__main__":
    initialize_postgres_database()