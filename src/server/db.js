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

async function getLastText() {
  const keys = await getDynamoDBItems()
  const lastKey = keys[keys.length - 1]
  const item = await getItemByPartitionKey(lastKey)
  return item
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

async function getDynamoDBItems() {
  const params = {
    TableName: table_name,
    // ProjectionExpression: 'UnixTime',
  }
  const command = new ScanCommand(params)
  const res = await dbClient.send(command)
  if (!res.Items) throw new Error('No items found')
  // console.log(res.Items.map((a) => a.UnixTime.N))
  res.Items.sort((a, b) => b.UnixTime.N - a.UnixTime.N) // last item first
  return res.Items
}

export { getDynamoDBItems, saveTextToDB }
