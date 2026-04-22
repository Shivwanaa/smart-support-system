import { Kafka } from "kafkajs";
import {pool} from "./index.js";
const kafka = new Kafka({
  clientId: "ticket-service",
  brokers: ["kafka:9092"], // docker
});
const consumer = kafka.consumer({ groupId: "ticket-service-group" });
export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "ticket-classified" });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("Received classification:", data);
      await pool.query(
        `UPDATE tickets
         SET category = $1,
             priority = $2
         WHERE id = $3`,
        [data.category, data.priority, data.ticket_id]
      );
      console.log("Ticket updated successfully");
    },
  });
};