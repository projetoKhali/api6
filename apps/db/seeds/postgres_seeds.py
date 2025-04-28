from sqlalchemy.orm import sessionmaker
from db.postgres import (
    get_engine,
    test_connection,
    User,
    Permission
)


def insert_seeds(session):
    try:
        insert_users(session)
        insert_permissions(session)
    except Exception as e:
        raise Exception("Erro ao inserir seeds:", e) from e


def insert_users(session):
    new_user = User(
        name="Alice",
        login="alice01",
        password="secret",
        version_terms_agreement="v1"
    )

    session.add(new_user)
    session.commit()
    print("Usuário inserido com sucesso!")


def insert_permissions(session):
    new_permission = Permission(
        name="read",
        description="Permissão de leitura"
    )

    session.add(new_permission)
    session.commit()
    print("Permissão inserida com sucesso!")


if __name__ == "__main__":
    engine = get_engine()

    test_connection(engine)

    insert_seeds(sessionmaker(bind=engine)())
