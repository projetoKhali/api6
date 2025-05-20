import bcrypt
from cryptography.fernet import Fernet
from faker import Faker
from datetime import datetime, timedelta
import random
from db.pg_keys import (
    get_keys_engine,
    UserKey,
    DeletedUser
)
from db.postgres import (
    get_engine,
    test_connection,
    User,
    Permission
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
    permissions = [
        Permission(name=f"perm_{i}", description=fake.sentence())
        for i in range(NUM_PERMISSIONS)
    ]

    session.add_all(permissions)
    print(f"✅ {NUM_PERMISSIONS} permissões criadas.")
    return permissions


def insert_users(session, permissoes):
    users = []
    keys_engine = get_keys_engine()
    KeysSession = sessionmaker(bind=keys_engine)
    keys_session = KeysSession()

    # default user for easy login
    default_password = "$2b$12$Z/6HIJK2f/uJ56UHCS6hYeAf2uZkd2wDc6uxrHp99z38VJIO3Ri8i"  # "secret"
    default_key = Fernet.generate_key()
    fernet = Fernet(default_key)
    user = User(
        name=fernet.encrypt("Alice".encode()).decode(),
        login="a",
        email=fernet.encrypt("alice@mail.com".encode()).decode(),
        password=fernet.encrypt(default_password.encode()).decode(),
        version_terms_agreement=fernet.encrypt("v1".encode()).decode(),
    )
    users.append(user)
    session.add(user)
    session.flush()  # get user.id

    keys_session.add(UserKey(id=user.id, key=default_key.decode()))

    for i in range(NUM_USERS):
        name = fake.name()
        email = fake.unique.email()
        login = fake.unique.user_name()
        permission = random.choice(permissoes)

        raw_password = fake.password()
        hashed_password = bcrypt.hashpw(
            raw_password.encode("utf-8"),
            bcrypt.gensalt(rounds=DEFAULT_HASH_COST)
        ).decode("utf-8")

        # Decide se o usuário será soft-deletado
        if i < NUM_SOFT_DELETED:
            disabled_date = datetime.now() - timedelta(days=random.randint(31, 365))
        else:
            disabled_date = None

        key = Fernet.generate_key()
        fernet = Fernet(key)

        user = User(
            name=fernet.encrypt(name.encode()).decode(),
            email=fernet.encrypt(email.encode()).decode(),
            login=login,
            password=fernet.encrypt(hashed_password.encode()).decode(),
            version_terms_agreement=fernet.encrypt("v1.0".encode()).decode(),
            permission_id=permission.id,
            disabled_since=disabled_date
        )
        users.append(user)
        session.add(user)
        session.flush()  # get user.id

        keys_session.add(UserKey(id=user.id, key=key.decode()))

    session.commit()
    keys_session.commit()
    print(f"{NUM_USERS} usuários inseridos e encriptados.")
    print(f"{NUM_USERS + 1} chaves de usuário inseridas na base de chaves.")

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

    users = insert_users(session, permissions)

    insert_deleted_users(session, users)

    session.commit()

    print("Seed finalizada com sucesso.")


if __name__ == "__main__":
    insert_seeds()
