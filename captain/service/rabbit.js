const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

let connection, channel;

async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ captain");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
  }
}

async function publishToQueue(queueName, message) {
  if (!channel) {
    await connect();
  }
  try {
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`Message sent to queue ${queueName}`);
  } catch (error) {
    console.error("Failed to publish message", error);
  }
}

async function subscribeToQueue(queueName, callback) {
  if (!channel) {
    await connect();
  }
  try {
    await channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        callback(msg.content.toString());
        channel.ack(msg);
      }
    });
    console.log(`Subscribed to queue ${queueName}`);
  } catch (error) {
    console.error("Failed to subscribe to queue", error);
  }
}

module.exports = {
  publishToQueue,
  subscribeToQueue,
  connect,
};
