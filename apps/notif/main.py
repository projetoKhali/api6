from base64 import b64decode
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import yaml
from jinja2 import Template
from cryptography.fernet import Fernet

from db.pg_keys import Session as KeysSession, UserKey
from db.postgres import Session, User

def decrypt(cipher_text: str, key:bytes):
    try:
        fernet = Fernet(key)
        return fernet.decrypt(b64decode(cipher_text.encode())).decode()
    except Exception as e:
        print(f"Erro ao descriptografar: {e}")
        return None

def get_user_keys(user_ids):
    session = KeysSession()
    try:
        keys = session.query(UserKey).filter(UserKey.id.in_(user_ids)).all()
        return {key.id: key.key for key in keys}
    finally:
        session.close()

def load_config():
    with open('apps/notif/config.yaml', 'r') as f:
        return yaml.safe_load(f)

def filter_users(session, filters):
    query = session.query(User)
    users = query.all()
    
    if not users:
        return []

    user_ids = [user.id for user in users]
    user_keys = get_user_keys(user_ids)

    decrypted_users = []

    for user in users:
        key = user_keys.get(user.id)
        if not key:
            print(f"Chave não encontrada para o usuário ID {user.id}, pulando...")
            continue

        try:
            decrypted_users.append({
                'id': user.id,
                'name': decrypt(user.name, key),
                'email': decrypt(user.email, key),
                'login': user.login,
                'permission_id': user.permission_id,
                'disabled_since': user.disabled_since
            })
        except Exception as e:
            print(f"Erro ao descriptografar dados do usuário ID {user.id}: {e}")
            continue

    filtered_users = []
    for user in decrypted_users:
        skip = False
        
        if 'permission_id' in filters and filters['permission_id'] is not None:
            if user['permission_id'] != filters['permission_id']:
                skip = True

        if 'disabled' in filters:
            if filters['disabled'] and user['disabled_since'] is None:
                skip = True
            elif not filters['disabled'] and user['disabled_since'] is not None:
                skip = True

        if 'email_domain' in filters and filters['email_domain']:
            if not user['email'].endswith(filters['email_domain']):
                skip = True

        if 'user_id' in filters and filters['user_id']:
            if isinstance(filters['user_id'], list):
                if user['id'] not in filters['user_id']:
                    skip = True
            elif user['id'] != filters['user_id']:
                skip = True

        if 'login-conteins' in filters and filters['login-conteins']:
            if filters['login-conteins'].lower() not in user['login'].lower():
                skip = True

        if 'name-conteins' in filters and filters['name-conteins']:
            if filters['name-conteins'].lower() not in user['name'].lower():
                skip = True

        if not skip:
            filtered_users.append(user)

    return filtered_users

def send_email(smtp_config, email_config, user):
    try:
        msg = MIMEMultipart()
        msg['From'] = email_config['from']
        msg['To'] = user['email']
        msg['Subject'] = email_config['subject']

        body_template = Template(email_config['body'])
        body = body_template.render(name=user['name'])

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(smtp_config['host'], smtp_config['port']) as server:
            server.starttls()
            server.login(smtp_config['user'], smtp_config['password'])
            server.sendmail(email_config['from'], user['email'], msg.as_string())

        print(f"Email enviado para {user['email']}")
    except Exception as e:
        print(f"Erro ao enviar email para {user['email']}: {e}")

def main():
    config = load_config()
    filters = config.get('filters', {})
    email_config = config['email']
    smtp_config = config['smtp']

    session = Session()
    try:
        users = filter_users(session, filters)
        
        if not users:
            print("Nenhum usuário encontrado com os filtros aplicados.")
            return

        print(f"Encontrados {len(users)} usuários. Enviando e-mails...")

        for user in users:
            try:
                send_email(smtp_config, email_config, user)
            except Exception as e:
                print(f"Falha ao processar usuário {user['id']}: {e}")
                continue

    finally:
        session.close()

if __name__ == "__main__":
    main()