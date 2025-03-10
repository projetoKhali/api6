from sqlalchemy import create_engine, text, Column, Integer, String, Text, Sequence
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:secret@localhost:5432/postgres"

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

def create_user(name, login, password):
    session = Session()
    # TODO - Validar se login já existe e criptografar a senha
    new_user = User(name=name, login=login, password=password)
    session.add(new_user)
    session.commit()
    session.close()

def get_user(user_id):
    session = Session()
    user = session.query(User).filter(User.id == user_id).first()
    session.close()
    return user

def update_user(user_id, name=None, login=None, password=None):
    session = Session()
    user = session.query(User).filter(User.id == user_id).first()
    if user:
        if name:
            user.name = name
        if login:
            user.login = login
        if password:
            user.password = password
        session.commit()
    session.close()

def delete_user(user_id):
    session = Session()
    user = session.query(User).filter(User.id == user_id).first()
    if user:
        session.delete(user)
        session.commit()
    session.close()

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

    # Exemplo de uso das funções CRUD
    create_user("John Doe", "johndoe", "password123")

    user = get_user(1)
    print(user.name, user.login, user.password)

    update_user(1, name="Jane Doe")
    user = get_user(1)
    print(user.name, user.login, user.password)

    delete_user(1)
    user = get_user(1)
    print(user)