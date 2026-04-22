import json
import classifier
from confluent_kafka import Consumer, Producer
consumer = Consumer({
    "bootstrap.servers": "kafka:9092",
    "group.id": "classification-group",
    "auto.offset.reset": "earliest"
})
producer = Producer({
    "bootstrap.servers": "kafka:9092"
})
consumer.subscribe(["ticket-created"])
print("Classification service started...")

# ---------------- Main Loop ----------------

while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue
    if msg.error():
        print("Consumer error:", msg.error())
        continue
    # Decode message
    ticket = json.loads(msg.value().decode("utf-8"))
    print("Received ticket:", ticket)
    text = f"{ticket['subject']} {ticket['description']}"
    # -------- Category Prediction --------
    category_probs = classifier.category_model.predict_proba([text])[0]
    category_classes = classifier.category_model.classes_
    category_idx = category_probs.argmax()
    predicted_category = category_classes[category_idx]
    category_confidence = round(float(category_probs[category_idx]), 4)

    # -------- Priority Prediction --------
    priority_probs = classifier.priority_model.predict_proba([text])[0]
    priority_classes = classifier.priority_model.classes_
    priority_idx = priority_probs.argmax()
    predicted_priority = priority_classes[priority_idx]
    priority_confidence = round(float(priority_probs[priority_idx]), 4)

    is_low_confidence = category_confidence < 0.75
    # -------- Result Event --------
    result_event = {
        "ticket_id": ticket["ticket_id"],
        "category": predicted_category,
        "category_confidence": category_confidence,
        "priority": predicted_priority,
        "priority_confidence": priority_confidence,
        "is_low_confidence": is_low_confidence
    }
    # -------- Produce ticket-classified --------
    producer.produce(
        topic="ticket-classified",
        key=str(ticket["ticket_id"]),
        value=json.dumps(result_event)
    )
    producer.poll(0)
    print("Published ticket-classified event")