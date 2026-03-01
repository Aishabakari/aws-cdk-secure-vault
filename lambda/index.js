const AWS = require("aws-sdk");
const pg = require("pg");

const secretsManager = new AWS.SecretsManager();

// Get database credentials from Secrets Manager
async function getDbCredentials() {
  try {
    const secretArn = process.env.SECRET_ARN;
    const secret = await secretsManager
      .getSecretValue({ SecretId: secretArn })
      .promise();

    // Parse the secret
    const credentials = JSON.parse(secret.SecretString);
    return credentials;
  } catch (error) {
    console.error("Error retrieving secret:", error);
    throw error;
  }
}

// Query the database
async function queryDatabase(credentials) {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: credentials.username,
    password: credentials.password,
    database: process.env.DB_NAME,

    // RDS often requires SSL connections from VPC clients; allow toggling via env var
    ssl: process.env.DB_REQUIRE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Execute a simple query
    const result = await client.query(
      "SELECT NOW() as current_time, version() as db_version",
    );

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await client.end();
  }
}

// Lambda handler
exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  try {
    // Fetch credentials from Secrets Manager
    const credentials = await getDbCredentials();

    // Query the database
    const result = await queryDatabase(credentials);

    return {
      statusCode: result.success ? 200 : 400,
      body: JSON.stringify(result),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
