from cryptography.fernet import Fernet
from faker import Faker
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import random
import sys
import os
from db.postgres import (
    get_engine,
    test_connection,
    User,
    UserKey,
    DeletedUser,
    Permission
)
from sqlalchemy.orm import sessionmaker

fake = Faker()
Faker.seed(42)
random.seed(42)

NUM_USERS = 10
NUM_PERMISSIONS = 2
NUM_SOFT_DELETED = 0
NUM_HARD_DELETED = 0


def insert_permissions(session):
    permissoes = [
        Permission(name=f"perm_{i}", description=fake.sentence())
        for i in range(NUM_PERMISSIONS)
    ]

    session.add_all(permissoes)
    print(f"✅ {NUM_PERMISSIONS} permissões criadas.")
    return permissoes


def insert_users(session, permissoes):
    users = [
        # default user for easy login
        User(
            name="Alice",
            login="a",
            email="alice@mail.com",
            password="$2b$12$Z/6HIJK2f/uJ56UHCS6hYeAf2uZkd2wDc6uxrHp99z38VJIO3Ri8i",  # "secret"
            version_terms_agreement="v1",
        )]
    keys = []

    for i in range(NUM_USERS):
        nome = fake.name().encode()
        email = fake.unique.email()
        login = fake.unique.user_name()
        senha = fake.password()
        perm = random.choice(permissoes)

        # Decide se o usuário será soft-deletado
        if i < NUM_SOFT_DELETED:
            disabled_date = datetime.now() - timedelta(days=random.randint(31, 365))
        else:
            disabled_date = None

        user = User(
            name=nome,
            email=email,
            login=login,
            password=senha,
            version_terms_agreement="v1.0",
            permission_id=perm.id,
            disabled_since=disabled_date
        )
        users.append(user)

    session.add_all(users)
    print(f"✅ {NUM_USERS} usuários inseridos.")

    # Gera chaves para cada usuário
    for user in users:
        chave = Fernet.generate_key().decode()
        keys.append(UserKey(
            usr_id=user.id,
            key=chave
        ))

    session.add_all(keys)
    print(f"\ueb11 {NUM_USERS} chaves de usuário inseridas.")

    return users


def insert_deleted_users(session, users):
    excluidos = random.sample(users, NUM_HARD_DELETED)

    ids_excluidos = [user.id for user in excluidos]
    deleted = [DeletedUser(usr_id=id_) for id_ in ids_excluidos]

    # Remove os usuários selecionados
    for id_ in ids_excluidos:
        session.query(User).filter(User.id == id_).delete()

    session.add_all(deleted)
    print(
        f"🗑️ {NUM_HARD_DELETED} usuários removidos e adicionados em deleted_users.")


def insert_seeds():
    engine = get_engine()

    test_connection(engine)

    session = sessionmaker(bind=engine)()

    print("🌱 Iniciando seeds...")
    permissions = insert_permissions(session)

    users = insert_users(session, permissions)

    insert_deleted_users(session, users)

    session.commit()

    print("✅ Seed finalizada com sucesso.")


if __name__ == "__main__":
    insert_seeds()
