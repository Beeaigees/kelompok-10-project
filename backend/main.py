from fastapi import FastAPI

app = FastAPI()

database_item = [  
  { id: 1, "name": "americano", "desc": "Classic black coffee...", "price": 25000, "image": "/americano.jpeg" },
  { id: 2, "name": "machiato", "desc": "Espresso with a dash of milk...", "price": 25000, "image": "/machiato.jpeg" },
  { id: 3, "name": "cappucino", "desc": "Rich espresso with frothy milk...", "price": 30000, "image": "/cappucino.jpeg" },
  { id: 4, "name": "latte", "desc": "Smooth espresso with steamed milk...", "price": 30000, "image": "/latte.jpeg" },
  { id: 5, "name": "matcha", "desc": "Premium green tea latte...", "price": 35000, "image": "/matcha.jpeg" },
  ]

@app.get("/")
def home():
    return {"message": "Hello Cafe!"}

@app.get("/item")
def get_all_item():
    return {"total": len(database_item), "items": [value for doc in database_item for value in doc.values()]}