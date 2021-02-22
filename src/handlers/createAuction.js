import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddlware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddlware(createAuction);
