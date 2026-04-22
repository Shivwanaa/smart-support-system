import {Kafka} from "kafkajs"
import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app=express();
app.use(express.json());
const kafka=new Kafka({
    clientId:"notification-service",
    brokers: ["kafka:9092"]
});
const consumer=kafka.consumer({groupId:"notification-group"});
async function start(){
    await consumer.connect();
    await consumer.subscribe({topic:"ticket-created"});
    await consumer.subscribe({topic:"ticket-classified"});
    await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      if (topic === "ticket-created") {
        console.log(` Ticket Created: ID ${data.ticket_id}`);
      }
      if (topic === "ticket-classified") {
        console.log(`Ticket ${data.ticket_id} classified as ${data.category} with priority ${data.priority}`);
      }
    },
  });
}
start();
const PORT = process.env.PORT || 5003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Noti service running on port ${PORT}`);
});
