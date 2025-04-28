import os
import subprocess
import psycopg2
from dotenv import load_dotenv
from daily_backup import create_backup

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "api6_postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "secret")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DOCKER_CONTAINER = os.getenv("DB_CONTAINER", "api6_postgres")

BACKUP_DIR = os.getenv("BACKUP_DIR", "./bkp")
if not os.path.exists(BACKUP_DIR):
    os.makedirs(BACKUP_DIR)


def find_backup_file(backup_file_name=None):
    """
    :param backup_file_name (optional): format yyyy-mm-dd. The name of the backup file to restore.
    :return: The path to the backup file.
    """
    if not backup_file_name:
        files = [f for f in os.listdir(BACKUP_DIR) if f.endswith(".dump")]
        if not files:
            print("No backup files found.")
            return None
        latest_file = max([os.path.join(BACKUP_DIR, f)
                          for f in files], key=os.path.getctime)
        return latest_file

    files = [f for f in os.listdir(BACKUP_DIR) if f == backup_file_name]
    if not files:
        print("No backup files found.")
        return None
    latest_file = max([os.path.join(BACKUP_DIR, f)
                      for f in files], key=os.path.getctime)
    return latest_file


def backup_restore(backup_path):
    create_backup("backup_before_restore_")
    os.environ["PGPASSWORD"] = DB_PASSWORD
    file_name = os.path.basename(backup_path)
    container_path = f"/var/lib/postgresql/data/{file_name}"

    try:
        subprocess.run(["docker", "cp", backup_path,
                       f"{DOCKER_CONTAINER}:{container_path}"], check=True)

        command = [
            "docker", "exec",
            "-e", f"PGPASSWORD={DB_PASSWORD}",
            DOCKER_CONTAINER,
            "pg_restore",
            "-U", DB_USER,
            "-p", DB_PORT,
            "-d", DB_NAME,
            "-c",                # drop + create
            "--no-owner",
            "--no-comments",
            "--no-acl",
            "-t", "users",
            "-t", "permissions",
            container_path
        ]

        subprocess.run(command, check=True)
        subprocess.run(["docker", "exec", DOCKER_CONTAINER,
                       "rm", container_path], check=True)
    except subprocess.CalledProcessError as e:
        raise Exception(f"❌ Erro durante restauração: {e}") from e


def remove_deleted_users():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id FROM deleted_users")
        ids = cursor.fetchall()

        for (id,) in ids:
            cursor.execute("DELETE FROM users usr WHERE usr.id = %s;", (id,))
            cursor.execute(
                "DELETE FROM permissions pm WHERE pm.id = %s;", (id,))

        conn.commit()
    except Exception as e:
        raise Exception(f"❌ Erro ao limpar usuários: {e}") from e
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    try:
        backup_path = find_backup_file(
            "backup_users_permissions_2025-04-09.dump")
        backup_restore(backup_path)
        remove_deleted_users()
    except Exception as e:
        raise Exception(f"❌ Falha durante a restauração: {e}") from e
