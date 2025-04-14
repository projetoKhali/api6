import subprocess
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "api6_postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "secret")
DB_PORT = os.getenv("DB_PORT", "5432")
BACKUP_DIR = os.getenv("BACKUP_DIR", "./bkp")
DOCKER_CONTAINER = os.getenv("container_name", "api6_postgres")

TABELAS = ["users", "permissions"]

def generate_file_name(bkp_file_name):
    data = datetime.now().strftime("%Y-%m-%d")
    return f"{bkp_file_name}{data}.dump"

def create_backup(bkp_file_name="backup_users_permissions_"):
    # Garante que a pasta local existe
    os.makedirs(BACKUP_DIR, exist_ok=True)

    file_name = generate_file_name(bkp_file_name)
    container_path = f"/var/lib/postgresql/data/{file_name}"
    host_path = os.path.join(BACKUP_DIR, file_name)

    comando = [
        "docker", "exec",
        "-e", f"PGPASSWORD={DB_PASSWORD}",
        DOCKER_CONTAINER,
        "pg_dump",
        "-U", DB_USER,
        "-p", DB_PORT,
        "-d", DB_NAME,
        "-F", "c",
        *sum([["-t", tabela] for tabela in TABELAS], []),
        "-f", container_path
    ]

    try:
        subprocess.run(comando, check=True)

        subprocess.run(["docker", "cp", f"{DOCKER_CONTAINER}:{container_path}", host_path], check=True)
        subprocess.run(["docker", "exec", DOCKER_CONTAINER, "rm", container_path], check=True)

    except subprocess.CalledProcessError as e:
        print(f"❌ Erro durante processo de backup: {e}")

if __name__ == "__main__":
    create_backup()
