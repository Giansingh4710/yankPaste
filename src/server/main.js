import express from 'express'
import ViteExpress from 'vite-express'
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import dotenv from 'dotenv'
dotenv.config()

const table_name = 'YankPasteTable'
const dbClient = new DynamoDBClient({
  region: 'us-east-1',
  credential: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})


import bodyParser from 'body-parser'
const app = express() // to get POST requests data
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.get('/api/test', (req, res) => {
  res.send('Hello Vite + React from server!')
})

app.get('/saveUrlText', async (req, res) => {
  try {
    await saveTextToDB(req.query.text, 'GET')
    res.json({ message: 'Text saved in DB!' })
  } catch (error) {
    res.status(500)
    const message = error.message || 'Error saving text in DB!'
    res.json({ message: message })
  }
})

app.post('/saveText', async (req, res) => {
  try {
    await saveTextToDB(req.body.text, 'POST')
    res.json({ message: 'Text saved in DB!' })
  } catch (error) {
    res.status(500)
    const message = error.message || 'Error saving text in DB!'
    res.json({ message: message })
  }
})

app.get('/getLastText', async (req, res) => {
  try {
    const item = await getLastText()
    res.json({ item })
  } catch (error) {
    res.status(500)
    const message = error.message || 'Error getting text from DB!'
    res.json({ message: message })
  }
})

async function saveTextToDB(text, type) {
  if (!text) throw new Error('No text to save!')
  const db_params = {
    TableName: table_name,
    Item: {
      UnixTime: { N: Date.now().toString() },
      text: { S: text },
      from: { S: type },
    },
  }
  const db_command = new PutItemCommand(db_params)
  await dbClient.send(db_command)
}

async function getLastText() {
  const keys = await getDynamoDBKeys()
  const lastKey = keys[keys.length - 1]
  const item = await getItemByPartitionKey(lastKey)
  return item
}

async function getDynamoDBKeys() {
  const params = {
    TableName: table_name,
    ProjectionExpression: 'UnixTime',
  }
  const command = new ScanCommand(params)
  const res = await dbClient.send(command)
  if (!res.Items) throw new Error('No items found')
  const keys = res.Items.map((item) => item.UnixTime.N)
  keys.sort()
  return keys
}

async function getItemByPartitionKey(partitionKey) {
  const params = {
    TableName: table_name,
    Key: {
      UnixTime: { N: partitionKey },
    },
  }
  const command = new GetItemCommand(params)
  const res = await dbClient.send(command)
  if (!res.Item) throw new Error('Item not found')
  return res.Item
}

ViteExpress.listen(app, 3000, () =>
  console.log('Server is listening on port 3000...'),
)
