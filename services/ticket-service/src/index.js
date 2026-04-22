import express from "express";
import bcrypt from "bcryptjs";
import pkg from "pg";
import cors from "cors";
import {Kafka} from "kafkajs"
import {authenticateUsers, authenticateAgents} from "./middleware/authmiddleware.js";
import dotenv from "dotenv";
import { startConsumer } from "./kafkaConsumer.js";
dotenv.config();
const { Pool } = pkg;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json());
//Create ticket
startConsumer();
const kafka = new Kafka({
  clientId: "ticket-service",
  brokers: ["kafka:9092"],
});
const producer=kafka.producer();
await producer.connect();
export const  pool = new Pool({
  host: "postgres",
  user: "admin",
  password: "admin",
  database: "supportdb",
  port: 5432,
});
app.post('/create-ticket',authenticateUsers,async(req,res)=>{
  try{
  const{id}=req.user;
  const{subject,description,channel}=req.body;
  const{rows:[ticket]}=await pool.query(`insert into tickets(reference_number,subject,description,channel,created_by)
    values('TEMP',$1,$2,$3,$4)
    returning *`,[subject, description, channel,id])
  const ref =`TKT-${String(ticket.id).padStart(5,'0')}`
  await pool.query(
    'UPDATE tickets SET reference_number = $1 WHERE id = $2',
    [ref, ticket.id]
  )
  const t={
    ticket_id: ticket.id,
    subject:subject,
    description:description
  };
  await producer.send({
      topic: "ticket-created",
      messages: [
        {
          key: String(ticket.id),
          value: JSON.stringify({
            ticket_id: ticket.id,
            subject,
            description,
          }),
        },
      ],
});
  //ticket-events
  await pool.query(
    `INSERT INTO ticket_events(ticket_id,event_type,new_value,changed_by)
     VALUES ($1, 'created', $2, $3)`,
    [ticket.id, JSON.stringify({ status: 'open' }),id]
  )
  res.status(201).json({ ...ticket, reference_number: ref })
}
catch(err){
  console.log(err);
}
});
//pagination-going to use cursor pagination
app.get('/get-tickets', authenticateUsers, async (req, res) => {
  try {
    const {cursor} = req.query
    const limit = Number(req.query.limit) || 20
    const {rows}=cursor
      ? await pool.query(`SELECT * FROM tickets
           WHERE is_deleted = FALSE AND id < $1
           ORDER BY id DESC
           LIMIT $2`,
          [cursor, limit]
        )
      : await pool.query(`SELECT * FROM tickets
           WHERE is_deleted = FALSE
           ORDER BY id DESC
           LIMIT $1`,
          [limit]
        )
    const nextCursor =
      rows.length === limit
        ? rows[rows.length - 1].id
        : null
    res.json({data: rows,nextCursor})
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
app.patch('/tickets/:id/status', authenticateAgents, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const changed_by = req.user.id;
  try {
    // Fetch current ticket
    const { rows: [current] } = await pool.query(
      'SELECT * FROM tickets WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    if (!current) return res.status(404).json({ error: 'Ticket not found' });
    const allowed = {
      open:        ['assigned', 'in_progress'],
      assigned:    ['in_progress', 'closed'],
      in_progress: ['resolved', 'closed'],
      resolved:    ['closed', 'open'],
      closed:      []
    };
    if (!allowed[current.status].includes(status)) {
      return res.status(400).json({ 
        error: `Agents cannot transition from ${current.status} to ${status}` 
      });
    }
    const { rows: [updated] } = await pool.query(
      'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    await pool.query(
      `INSERT INTO ticket_events (ticket_id, event_type, old_value, new_value, changed_by)
       VALUES ($1, 'status_changed', $2, $3, $4)`,
      [id, JSON.stringify({ status: current.status }), JSON.stringify({ status }), changed_by]
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
//for now 4 teams, each team 4 people
app.patch('/update-ticket',authenticateAgents,async(req,res)=>{

  const valid_states=[];
});
//sending data to classification-service
//recieving classified info from classification-service and updating the ticket db ,ticket events

//Search / Filter Tickets
//Soft Delete Ticket
//Get Single Ticket
//cache
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth service running on port ${PORT}`);
});


