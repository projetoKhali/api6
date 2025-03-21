import pandas as pd
from mongo_db import MongoDB

db = MongoDB.get_database("reforestation")
df = pd.read_csv("apps/db/crop_yield.csv")

# retirando valores nulos
df = df.dropna()

# eliminando espaço em branco
df.columns = df.columns.str.strip()
df["Crop"] = df["Crop"].str.strip()
df["Season"] = df["Season"].str.strip()
df["State"] = df["State"].str.strip()

# Atualizando estado para estados brasileiros
update_states = {
    "Assam": "Acre",
    "Karnataka": "Alagoas",
    "Kerala": "Amapá",
    "Meghalaya": "Amazonas",
    "West Bengal": "Bahia",
    "Puducherry": "Ceará",
    "Goa": "Distrito Federal",
    "Andhra Pradesh": "Espírito Santo",
    "Tamil Nadu": "Goiás",
    "Odisha": "Maranhão",
    "Bihar": "Mato Grosso",
    "Gujarat": "Mato Grosso do Sul",
    "Madhya Pradesh": "Minas Gerais",
    "Maharashtra": "Pará",
    "Mizoram": "Paraíba",
    "Punjab": "Paraná",
    "Uttar Pradesh": "Pernambuco",
    "Haryana": "Piauí",
    "Himachal Pradesh": "Rio de Janeiro",
    "Tripura": "Rio Grande do Norte",
    "Nagaland": "Rio Grande do Sul",
    "Chhattisgarh": "Rondônia",
    "Uttarakhand": "Roraima",
    "Jharkhand": "Santa Catarina",
    "Delhi": "São Paulo",
    "Manipur": "Sergipe",
    "Jammu and Kashmir": "Tocantins",
    "Telangana": "Maranhão",
    "Arunachal Pradesh": "Pará",
    "Sikkim": "Pernambuco",
}
df["State"] = df["State"].replace(update_states)

# alterando valores de estação
update_season = {
    "Kharif": "Spring",
    "Rabi": "Autumn",
}
df["Season"] = df["Season"].replace(update_season)


def seed_populate(df):
    try:
        species = df["Crop"].unique()
        for sp in species:
            db.species_collection.insert_one({"scientific_name": sp, "common_name": sp})

        for row in df.itertuples():
            crop = row.Crop
            crop_year = row.Crop_Year
            season = row.Season
            state = row.State
            area = row.Area
            production = row.Production
            annual_rainfall = row.Annual_Rainfall
            fertilizer = row.Fertilizer
            pesticide = row.Pesticide
            yield_ = row.Yield

            # collection plots
            db.plots_collection.insert_one(
                {"area": row.Area, "state": row.State, "country": "Brazil"}
            )
            # collection yield
            db.yield_collection.insert_one(
                {
                    "crop": crop,
                    "crop_year": crop_year,
                    "season": season,
                    "state": state,
                    "area": area,
                    "production": production,
                    "annual_rainfall": annual_rainfall,
                    "fertilizer": fertilizer,
                    "pesticide": pesticide,
                    "yield": yield_,
                }
            )
        return "Dados inseridos com sucesso!"
    except Exception as e:
        print(f"Erro ao ao popular banco de dados: {e}")
        return


seed_populate(df)
