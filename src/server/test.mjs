import {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
const table_name = 'YankPasteTable'
const dbClient = new DynamoDBClient({ region: 'us-east-1' })

async function getDynamoDBKeys() {
  const params = {
    TableName: table_name,
    ProjectionExpression: 'UnixTime',
  }
  const command = new ScanCommand(params)
  const res = await dbClient.send(command)
  if (!res.Items) throw new Error('No items found')
  const keys = res.Items.map((item) => item.UnixTime.N)
  return keys
}

async function getItemByPartitionKey(partitionKey) {
  const params = {
    TableName: table_name,
    Key: {
      UnixTime: { N: partitionKey },
    },
  }
  const command = new GetItemCommand(params);
  const res = await dbClient.send(command)
  if (!res.Item) throw new Error('Item not found')
  return res.Item
}

const a = await getDynamoDBKeys()
// const b = await getItemByPartitionKey(a[1])
