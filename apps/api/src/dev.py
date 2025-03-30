import os
import shutil


def print_routes(app):
    """Pretty-print registered routes as a tree view (only in non-production environments)."""
    if os.getenv("FLASK_ENV") == "production" or os.getenv("WERKZEUG_RUN_MAIN") != "true":
        return

    from colorama import init, Fore
    init(autoreset=True)

    terminal_width = shutil.get_terminal_size().columns
    border = "=" * terminal_width

    print(f"\n{Fore.GREEN}📌 Registered Routes:{Fore.RESET}")
    print(border)

    for blueprint, rules in group_routes_by_blueprint(app):
        print(f"{Fore.CYAN}📂 {blueprint or 'Default Blueprint'}:{Fore.RESET}")
        for rule in rules:

            route = rule.rule
            title = rule.endpoint
            if blueprint:
                title = title.replace(f"{blueprint}.", "", 1)

            methods = ",".join(sorted(rule.methods - {"HEAD", "OPTIONS"}))
            method_colors = {
                "GET": Fore.GREEN,
                "POST": Fore.BLUE,
                "PUT": Fore.YELLOW,
                "DELETE": Fore.RED,
                "PATCH": Fore.MAGENTA,
            }

            for method in methods.split(","):
                print(
                    f"    {method_colors.get(method, Fore.WHITE)}📍 {title:25} ➝ {method:7} {route}{Fore.RESET}")

    print(border, "\n")


def group_routes_by_blueprint(app):
    """Group routes by blueprint."""
    blueprint_routes = {}

    for rule in app.url_map.iter_rules():

        if "static" not in rule.endpoint:
            blueprint_name = rule.endpoint.split(
                '.')[0] if '.' in rule.endpoint else None
            blueprint_routes.setdefault(blueprint_name, []).append(rule)

    return blueprint_routes.items()
