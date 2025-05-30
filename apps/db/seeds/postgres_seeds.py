import bcrypt
from cryptography.fernet import Fernet
from faker import Faker
from datetime import datetime, timedelta
import random
from db.keys import (
    get_keys_engine,
    EntityKey,
)
from db.postgres import (
    get_engine,
    test_connection,
    User,
    ExternalClient,
    Permission,
    Role
)
from sqlalchemy.orm import sessionmaker
from base64 import b64encode

fake = Faker()
Faker.seed(42)
random.seed(42)

DEFAULT_HASH_COST = 12

NUM_PERMISSIONS = 2

NUM_USERS = 10
NUM_USERS_DISABLED = 0

NUM_EXTERNAL_CLIENTS = 9
NUM_EXTERNAL_CLIENTS_DISABLED = 0


def insert_permissions(session):
    permission_names = [
        "dashboard",
        "register",
        "analitic",
        "terms",
    ]

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
    users = []
    keys_session = sessionmaker(bind=get_keys_engine())()

    def encrypt_user(
        fernet: Fernet,
        user: User,
    ):
        return User(
            name=encrypt_field(fernet, user.name),
            login=user.login,
            email=encrypt_field(fernet, user.email),
            password=encrypt_field(fernet, user.password),
            version_terms_agreement=encrypt_field(
                fernet,
                user.version_terms_agreement
            ),
            role_id=user.role_id
        )

    def add_user(
        name: str,
        login: str,
        email: str,
        password: str,
        version_terms_agreement: str,
        role_id: int,
        disabled_since: datetime | None = None
    ):
        key = Fernet.generate_key()
        fernet = Fernet(key)
        user = encrypt_user(fernet, User(
            name=name,
            login=login,
            email=email,
            password=password,
            version_terms_agreement=version_terms_agreement,
            role_id=role_id,
            disabled_since=disabled_since,
        ))
        users.append(user)
        session.add(user)
        session.flush()  # get user.id

        keys_session.add(EntityKey(
            id=user.id,
            key=key.decode(),
            entity_type="user",
        ))

    add_user(  # default user for easy login
        name="Alice",
        login="a",
        email="alice@email.com",
        password=hash_password("secret"),
        version_terms_agreement="v1.0",
        role_id=roles[0].id
    )

    for i in range(NUM_USERS):
        # Decide se o usuário será soft-deletado
        disabled_date = None
        if i < NUM_USERS_DISABLED:
            disabled_date = datetime.now() - timedelta(days=random.randint(31, 365))

        add_user(
            name=fake.name(),
            email=fake.unique.email(),
            login=fake.unique.user_name(),
            password=hash_password(fake.password()),
            version_terms_agreement="v1.0",
            role_id=random.choice(roles).id,
            disabled_since=disabled_date,
        )

    session.add_all(users)
    print(f"{NUM_USERS} usuários inseridos.")

    session.commit()
    keys_session.commit()
    print(f"{NUM_USERS + 1} usuários inseridos e encriptados.")
    print(f"{NUM_USERS + 1} chaves de usuário inseridas.")

    return users


def insert_external_clients(session):
    external_clients = []
    keys_session = sessionmaker(bind=get_keys_engine())()

    def encrypt_external_client(
        fernet: Fernet,
        external_client: ExternalClient,
    ):
        return ExternalClient(
            name=encrypt_field(fernet, external_client.name),
            login=external_client.login,
            password=encrypt_field(fernet, external_client.password),
        )

    def add_external_client(
        name: str,
        login: str,
        password: str,
        disabled_since: datetime | None = None
    ):
        key = Fernet.generate_key()
        fernet = Fernet(key)
        external_client = encrypt_external_client(fernet, ExternalClient(
            name=name,
            login=login,
            password=password,
            disabled_since=disabled_since,
        ))
        external_clients.append(external_client)
        session.add(external_client)
        session.flush()  # get external_client.id

        keys_session.add(EntityKey(
            id=external_client.id,
            key=key.decode(),
            entity_type="external_client",
        ))

    add_external_client(  # default external_client for easy login
        name="Canva",
        login="canva",
        password=hash_password("secret"),
    )

    for i in range(NUM_EXTERNAL_CLIENTS):
        disabled_date = None
        if i < NUM_EXTERNAL_CLIENTS_DISABLED:
            disabled_date = datetime.now() - timedelta(days=random.randint(31, 365))

        add_external_client(
            name=fake.name(),
            login=fake.unique.external_client_name(),
            password=hash_password(fake.password()),
            disabled_since=disabled_date
        )

    session.add_all(external_clients)
    print(f"{NUM_USERS} usuários inseridos.")

    session.commit()
    keys_session.commit()
    print(f"{NUM_USERS + 1} usuários inseridos e encriptados.")
    print(f"{NUM_USERS + 1} chaves de usuário inseridas.")

    return external_clients


def encrypt_field(
    fernet: Fernet,
    field: str,
):
    return b64encode(fernet.encrypt(field.encode())).decode()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(rounds=DEFAULT_HASH_COST)
    ).decode("utf-8")


def insert_seeds():
    engine = get_engine()
    test_connection(engine)
    session = sessionmaker(bind=engine)()

    print("Iniciando seeds...")

    permissions = insert_permissions(session)
    roles = insert_roles(session, permissions)
    insert_users(session, roles)

    insert_external_clients(session)

    print("Seed finalizada com sucesso.")


if __name__ == "__main__":
    insert_seeds()
