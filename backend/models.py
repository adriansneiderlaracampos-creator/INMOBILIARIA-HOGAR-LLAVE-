from typing import Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]

IMAGEN_POR_DEFECTO = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"

class InmuebleModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    titulo_anuncio: str = Field(..., min_length=3, example="Apartamento moderno con balcón")
    zona_ciudad: str = Field(..., min_length=2, example="Mosquera - El Trébol")
    canon_arriendo: float = Field(..., gt=0, example=1250000)
    disponible: bool = Field(default=True)
    imagen_url: Optional[str] = Field(default=IMAGEN_POR_DEFECTO)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "titulo_anuncio": "Casa Campestre 3 Habitaciones",
                "zona_ciudad": "Funza - Centro",
                "canon_arriendo": 1800000,
                "disponible": True,
                "imagen_url": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80"
            }
        }

class InmuebleUpdateModel(BaseModel):
    titulo_anuncio: Optional[str] = None
    zona_ciudad: Optional[str] = None
    canon_arriendo: Optional[float] = None
    disponible: Optional[bool] = None
    imagen_url: Optional[str] = None