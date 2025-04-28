from sqlalchemy.orm import sessionmaker
from db.postgres import (
    get_engine,
    test_connection,
    User,
    Permission
)


def insert_seeds(session):
    try:
        insert_permissions(session)
        insert_users(session)
    except Exception as e:
        raise Exception("Erro ao inserir seeds:", e) from e


def insert_permissions(session):
    permissions = [Permission(
        name="read",
        description="Permissão de leitura"
    ),]

    session.add_all(permissions)

    print("Permissões inseridas com sucesso!")


def insert_users(session):
    users = [User(
        name="Alice",
        login="alice01",
        email="alice@mail.com",
        password="$2b$12$Z/6HIJK2f/uJ56UHCS6hYeAf2uZkd2wDc6uxrHp99z38VJIO3Ri8i", # "secret"
        version_terms_agreement="v1",
    ),]

    for i, user in enumerate(users):
        user.permission_id = i + 1

    session.add_all(users)
    print("Usuários inseridos com sucesso!")


if __name__ == "__main__":
    engine = get_engine()

    test_connection(engine)

    session = sessionmaker(bind=engine)()

    insert_seeds(session)

    session.commit()
