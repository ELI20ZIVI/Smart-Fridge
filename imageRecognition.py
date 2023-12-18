from ultralytics import YOLO
import time
import sys
import pymongo
from picamera2 import Picamera2

def connect_to_mongodb():

    # Sostituisci questi valori con le tue informazioni di connessione
    mongodb_url = "mongodb://localhost:27017/"
    client = pymongo.MongoClient(mongodb_url)
    
    # Sostituisci "your_database_name" con il nome effettivo del tuo database
    database = client.test
    
    return database

# Codice per aggiungere tutte le classi del modello al database
'''
data_to_insert = {
        "object": class_name,
        "quantity": count
    }
result = collection.insert_one(data_to_insert) 
'''

# Database connection
db = connect_to_mongodb()

# Sostituisci "your_collection_name" con il nome effettivo della tua raccolta (collection)
collection = db.products

# Load a pretrained YOLOv8n model
model = YOLO('yolov8m.pt')

# Initialize the camera
picam2 = Picamera2()
camera_config = picam2.create_preview_configuration()
picam2.configure(camera_config)
picam2.start()

def photoFunction():

    picam2.capture_file("image.jpg")

    # Run interface on the source
    results = model(source = "image.jpg", show = False, conf = 0.3, save = False) # -> Results generator

    class_count = {}  # Dizionario per memorizzare il conteggio delle classi

    for result in results:
        cls = result.boxes.cls
        classes = [result.names[int(c)] for c in cls]

        for class_name in classes:
            class_count[class_name] = class_count.get(class_name, 0) + 1

    print(class_count)

    for class_name, count in class_count.items():
        existing_document = collection.find_one({"object": class_name})

        if existing_document:
            # Update the quantity if the object exists
            collection.update_one({"object": class_name}, {"$set": {"quantity": count}})

        # Rimuovere quando si aggiungono tutte le classi al database
        else:
            # Insert the object if it doesn't exist
            data_to_insert = {
                "object": class_name,
                "quantity": count
            }
            print(data_to_insert)
            result = collection.insert_one(data_to_insert)
        
    for existing_document in collection.find():
        class_name = existing_document["object"]
        
        # Se la classe non è stata rilevata, imposta la quantità a 0
        if class_name not in class_count:
            collection.update_one({"object": class_name}, {"$set": {"quantity": 0}})

    time.sleep(10)

while (1):
    for line in sys.stdin:
        if line.strip() == "takePhoto":
            photoFunction()

picam2.stop()
