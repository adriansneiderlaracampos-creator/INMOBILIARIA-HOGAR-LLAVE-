from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from typing import List

from database import propiedades_collection
from models import InmuebleModel, InmuebleUpdateModel, IMAGEN_POR_DEFECTO

app = FastAPI(title="API Inmobiliaria Hogar & Llave - ADSO 3409609")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"mensaje": "API Inmobiliaria Hogar & Llave activa en hogar_llave_adso_db"}

@app.get("/api/propiedades", response_model=List[InmuebleModel])
async def listar_propiedades():
    propiedades = []
    cursor = propiedades_collection.find()
    async for documento in cursor:
        propiedades.append(documento)
    return propiedades

@app.post("/api/propiedades", response_model=InmuebleModel, status_code=status.HTTP_201_CREATED)
async def crear_propiedad(inmueble: InmuebleModel):
    inmueble_dict = inmueble.model_dump(by_alias=True, exclude=["id"])
    if not inmueble_dict.get("imagen_url") or not inmueble_dict["imagen_url"].strip():
        inmueble_dict["imagen_url"] = IMAGEN_POR_DEFECTO

    resultado = await propiedades_collection.insert_one(inmueble_dict)
    nueva_propiedad = await propiedades_collection.find_one({"_id": resultado.inserted_id})
    return nueva_propiedad

@app.put("/api/propiedades/{id}", response_model=InmuebleModel)
async def actualizar_propiedad(id: str, datos: InmuebleUpdateModel):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID de inmueble no válido")

    campos_actualizar = {k: v for k, v in datos.model_dump().items() if v is not None}

    if campos_actualizar:
        resultado = await propiedades_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": campos_actualizar}
        )
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Inmueble no encontrado")

    propiedad_actualizada = await propiedades_collection.find_one({"_id": ObjectId(id)})
    if propiedad_actualizada:
        return propiedad_actualizada
    raise HTTPException(status_code=404, detail="Inmueble no encontrado")

@app.delete("/api/propiedades/{id}")
async def eliminar_propiedad(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID de inmueble no válido")

    resultado = await propiedades_collection.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 1:
        return {"mensaje": "Inmueble eliminado correctamente"}
    raise HTTPException(status_code=404, detail="Inmueble no encontrado")