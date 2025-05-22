import bcrypt
from cryptography.fernet import Fernet
from faker import Faker
from datetime import datetime, timedelta
import random
from db.postgres import (
    get_engine,
    test_connection,
    User,
    UserKey,
    DeletedUser,
    Permission,
    Role
)
from sqlalchemy.orm import sessionmaker

fake = Faker()
Faker.seed(42)
random.seed(42)

DEFAULT_HASH_COST = 12

NUM_USERS = 10
NUM_PERMISSIONS = 2
NUM_SOFT_DELETED = 0
NUM_HARD_DELETED = 0


def insert_permissions(session):
    permission_names = ["dashboard", "register", "analitic", "terms"]
    permissions = [
        Permission(name=name, description=fake.sentence())
        for name in permission_names
    ]

    session.add_all(permissions)
    session.commit()
    print(f"{len(permissions)} permissões criadas: {', '.join(permission_names)}.")
    return permissions


def insert_roles(session, permissions):
    permission_dict = {perm.name: perm for perm in permissions}

    # ADM - todas as permissões
    adm_role = Role(
        name="adm",
        description="Administrador com acesso total",
        permissions=list(permissions)
    )

    # Agent - apenas algumas permissões
    agent_role = Role(
        name="agent",
        description="Agente com permissões limitadas",
        permissions=[
            permission_dict["dashboard"],
            permission_dict["analitic"],
            permission_dict["terms"]
        ]
    )

    roles = [adm_role, agent_role]
    session.add_all(roles)
    session.commit()

    print("Roles criadas: adm (todas permissões), agent (dashboard, analitic, terms).")
    return roles

def insert_users(session, roles):
    users = [
        User(
            name="Alice",
            email="alice@mail.com",
            login="a",
            password="$2b$12$Z/6HIJK2f/uJ56UHCS6hYeAf2uZkd2wDc6uxrHp99z38VJIO3Ri8i",
            version_terms_agreement="v1",
            role_id=roles[0].id
        )
    ]

    for i in range(NUM_USERS):
        name = fake.name()
        email = fake.unique.email()
        login = fake.unique.user_name()
        role = random.choice(roles)
        hashed_password = bcrypt.hashpw(
            fake.password().encode("utf-8"),
            bcrypt.gensalt(rounds=DEFAULT_HASH_COST)
        )

        disabled_date = datetime.now() - timedelta(days=random.randint(31, 365)) if i < NUM_SOFT_DELETED else None

        user = User(
            name=name,
            email=email,
            login=login,
            password=hashed_password.decode("utf-8"),
            version_terms_agreement="v1.0",
            role_id=role.id,
            disabled_since=disabled_date
        )
        users.append(user)

    session.add_all(users)
    print(f"{NUM_USERS} usuários inseridos.")

    # Gera chaves
    keys = [UserKey(id=user.id, key=Fernet.generate_key().decode()) for user in users]
    session.add_all(keys)
    print(f"{NUM_USERS} chaves de usuário inseridas.")

    session.commit()
    return users



def insert_deleted_users(session, users):
    excluidos = random.sample(users, NUM_HARD_DELETED)

    ids_excluidos = [user.id for user in excluidos]
    deleted = [DeletedUser(id=id_) for id_ in ids_excluidos]

    # Remove os usuários selecionados
    for id_ in ids_excluidos:
        session.query(User).filter(User.id == id_).delete()

    session.add_all(deleted)
    print(
        f"{NUM_HARD_DELETED} usuários removidos e adicionados em deleted_users.")


def insert_seeds():
    engine = get_engine()
    test_connection(engine)
    session = sessionmaker(bind=engine)()

    print("Iniciando seeds...")

    permissions = insert_permissions(session)
    roles = insert_roles(session, permissions)
    users = insert_users(session, roles)
    insert_deleted_users(session, users)

    print("Seed finalizada com sucesso.")


if __name__ == "__main__":
    insert_seeds()
