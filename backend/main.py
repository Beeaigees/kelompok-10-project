from fastapi import FastAPI
from pydantic import  BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_item = [  
  { "id": 1, "name": "americano", "desc": "Classic black coffee", "price": 25000, "image": "/americano.jpeg" },
  { "id": 2, "name": "machiato", "desc": "Espresso with a dash of milk", "price": 25000, "image": "/machiato.jpeg" },
  { "id": 3, "name": "cappucino", "desc": "Rich espresso with frothy milk", "price": 30000, "image": "/cappucino.jpeg" },
  { "id": 4, "name": "latte", "desc": "Smooth espresso with steamed milk", "price": 30000, "image": "/latte.jpeg" },
  { "id": 5, "name": "matcha", "desc": "Premium green tea latte", "price": 35000, "image": "/matcha.jpeg" },
  ]



@app.get("/")
def home():
    return {"message": "Hello Cafe!"}

@app.get("/item/")
def get_all_item():
    # return {"total": len(database_item), "items": [value for doc in database_item for value in doc.values()]}
    return {"total": len(database_item), "items": database_item}

@app.get("/item/{item_id}")
def get_item_byID(item_id: int):
    for item in database_item:
        if item["id"] == item_id:
            return item
    return "Id not found"

#define bentuk data buat nambahin item baru
class NewItem(BaseModel):
    name: str
    desc: str
    price : int
    image : str

@app.post("/item/")
def add_item(new_item: NewItem):
    new_id = len(database_item) + 1
    item_dict = new_item.dict()
    item_dict["id"] = new_id
    database_item.append(item_dict)
    return item_dict

@app.delete("/item/{item_id}")
def delete_item(item_id: int):
    for item in database_item:
        if item["id"] == item_id:
            database_item.remove(item)
            return {"Message": f"item dengan id: {item_id}, berhasil didelete"}
    return{f"item dengan id: {item_id}, tidak ditemukan"}

#bentuk data buat update item
class UpdateItem(BaseModel):
    name: str
    desc: str
    price: int
    image: str

@app.patch("/item/{item_id}")
def update_item(item_id: int, updated_data = UpdateItem):
    for item in database_item:
        if item["id"] == item_id:
            item["name"] = updated_data.name
            item["desc"] = updated_data.desc
            item["price"] = updated_data.price
            item["image"] = updated_data.image
    return{"item dengan Id: {item_id} tidak ketemu"}