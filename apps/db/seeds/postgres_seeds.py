import os
import sys
import random
from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from faker import Faker
from cryptography.fernet import Fernet

from apps.db.src.db.postgres import Base, User, Permission, Deleted_User, User_Key, get_engine

engine = get_engine()
Session = sessionmaker(bind=engine)
session = Session()

fake = Faker()
Faker.seed(42)
random.seed(42)

# Quantidades
NUM_USERS = 10
NUM_PERMISSIONS = 2
NUM_SOFT_DELETED = 0
NUM_HARD_DELETED = 0

def permissions_generate():
    permissoes = []
    for i in range(NUM_PERMISSIONS):
        p = Permission(
            name=f"perm_{i}",
            description=fake.sentence()
        )
        permissoes.append(p)
    session.add_all(permissoes)
    session.commit()
    print(f"✅ {NUM_PERMISSIONS} permissões criadas.")
    return permissoes

def users_generate(permissoes):
    usuarios = []
    chaves = []

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
        usuarios.append(user)

    session.add_all(usuarios)
    session.commit()
    print(f"✅ {NUM_USERS} usuários inseridos.")

    # Gera chaves para cada usuário
    for user in usuarios:
        chave = Fernet.generate_key().decode()
        chaves.append(User_Key(
            usr_id=user.id,
            key=chave
        ))

    session.add_all(chaves)
    session.commit()
    print(f"\ueb11 {NUM_USERS} chaves de usuário inseridas.")

    return usuarios

def deleted_users_generate(usuarios):
    excluidos = random.sample(usuarios, NUM_HARD_DELETED)

    ids_excluidos = [user.id for user in excluidos]
    deleted = [Deleted_User(usr_id=id_) for id_ in ids_excluidos]

    # Remove os usuários selecionados
    for id_ in ids_excluidos:
        session.query(User).filter(User.id == id_).delete()

    session.commit()
    session.add_all(deleted)
    session.commit()
    print(f"🗑️ {NUM_HARD_DELETED} usuários removidos e adicionados em deleted_users.")

def seeds_generate():
    print("🌱 Iniciando seed...")
    Base.metadata.create_all(engine)

    permissoes = permissions_generate()
    usuarios = users_generate(permissoes)
    deleted_users_generate(usuarios)
    print("✅ Seed finalizada com sucesso.")

if __name__ == "__main__":
    seeds_generate()
