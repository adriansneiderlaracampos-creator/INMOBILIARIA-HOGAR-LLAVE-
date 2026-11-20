import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hogar_llave_adso_db")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Colección asignada al Caso #7: Inmobiliaria "Hogar & Llave"
propiedades_collection = database.get_collection("propiedades")