import { ponder } from "ponder:registry";
import schema from "ponder:schema";

// Helper function to decode base64 metadata
function decodeBase64Metadata(uri: string): string | null {
  try {
    // Check if it's a data URI with base64
    if (uri.startsWith("data:application/json;base64,")) {
      const base64Data = uri.replace("data:application/json;base64,", "");
      const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
      return decoded;
    }
    return null;
  } catch (error) {
    console.error("Error decoding base64 metadata:", error);
    return null;
  }
}

ponder.on("ERC1155:TransferSingle", async ({ event, context }) => {
  // Create an Account for the sender, or update the balance if it already exists.
  await context.db
    .insert(schema.account)
    .values({ address: event.args.from })
    .onConflictDoNothing();

  await context.db
    .insert(schema.tokenBalance)
    .values({
      owner: event.args.from,
      tokenId: event.args.id,
      balance: -event.args.amount,
    })
    .onConflictDoUpdate((row) => ({
      balance: row.balance - event.args.amount,
    }));

  // Create an Account for the recipient, or update the balance if it already exists.
  await context.db
    .insert(schema.account)
    .values({ address: event.args.to })
    .onConflictDoNothing();

  await context.db
    .insert(schema.tokenBalance)
    .values({
      owner: event.args.to,
      tokenId: event.args.id,
      balance: event.args.amount,
    })
    .onConflictDoUpdate((row) => ({
      balance: row.balance + event.args.amount,
    }));

  // Handle token creation and total supply tracking
  // If this is the first transfer to a recipient (from zero address), it's a mint
  if (event.args.from === "0x0000000000000000000000000000000000000000") {
    // Fetch metadata from the contract
    let metadata = null;
    try {
      const uri = await context.client.readContract({
        abi: context.contracts.ERC1155.abi,
        address: context.contracts.ERC1155.address,
        functionName: "uri",
        args: [event.args.id],
      });
      metadata = decodeBase64Metadata(uri);
    } catch (error) {
      console.error("Error fetching metadata for token", event.args.id, error);
    }

    // Create or update token record
    await context.db
      .insert(schema.token)
      .values({
        id: event.args.id,
        createdAt: Number(event.block.timestamp),
        creator: event.args.to,
        total: event.args.amount,
        metadata: metadata,
      })
      .onConflictDoUpdate((row) => ({
        total: row.total + event.args.amount,
        metadata: metadata || row.metadata, // Keep existing metadata if new fetch fails
      }));
  }

  // Create a TransferEvent.
  await context.db.insert(schema.transferEvent).values({
    id: `${event.id}-0`,
    from: event.args.from,
    to: event.args.to,
    token: event.args.id,
    timestamp: Number(event.block.timestamp),
  });
});

ponder.on("ERC1155:TransferBatch", async ({ event, context }) => {
  await context.db
    .insert(schema.account)
    .values({ address: event.args.from })
    .onConflictDoNothing();
  await context.db
    .insert(schema.account)
    .values({ address: event.args.to })
    .onConflictDoNothing();

  for (let i = 0; i < event.args.ids.length; i++) {
    const id = event.args.ids[i]!;
    const amount = event.args.amounts[i]!;

    await context.db
      .insert(schema.tokenBalance)
      .values({
        owner: event.args.from,
        tokenId: id,
        balance: -amount,
      })
      .onConflictDoUpdate((row) => ({
        balance: row.balance - amount,
      }));

    await context.db
      .insert(schema.tokenBalance)
      .values({
        owner: event.args.to,
        tokenId: id,
        balance: amount,
      })
      .onConflictDoUpdate((row) => ({
        balance: row.balance + amount,
      }));

    // Handle token creation and total supply tracking for batch transfers
    if (event.args.from === "0x0000000000000000000000000000000000000000") {
      // Fetch metadata from the contract
      let metadata = null;
      try {
        const uri = await context.client.readContract({
          abi: context.contracts.ERC1155.abi,
          address: context.contracts.ERC1155.address,
          functionName: "uri",
          args: [id],
        });
        metadata = decodeBase64Metadata(uri);
      } catch (error) {
        console.error("Error fetching metadata for token", id, error);
      }

      // Create or update token record
      await context.db
        .insert(schema.token)
        .values({
          id: id,
          createdAt: Number(event.block.timestamp),
          creator: event.args.to,
          total: amount,
          metadata: metadata,
        })
        .onConflictDoUpdate((row) => ({
          total: row.total + amount,
          metadata: metadata || row.metadata, // Keep existing metadata if new fetch fails
        }));
    }

    await context.db.insert(schema.transferEvent).values({
      id: `${event.id}-${i}`,
      from: event.args.from,
      to: event.args.to,
      token: id,
      timestamp: Number(event.block.timestamp),
    });
  }
});
