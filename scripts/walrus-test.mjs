const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

// 1) Store a test blob on Walrus testnet (5 epochs)
const data = JSON.stringify({
  msg: "Hello Walrus from The Scout!",
  at: new Date().toISOString(),
});

const put = await fetch(`${PUBLISHER}/v1/blobs?epochs=5`, {
  method: "PUT",
  body: data,
});
const result = await put.json();

const blobId =
  result.newlyCreated?.blobObject?.blobId ||
  result.alreadyCertified?.blobId;
console.log("Blob ID:", blobId);

// 2) Read it back from Walrus
const back = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`).then((r) => r.text());
console.log("Read back:", back);
console.log("View in browser:", `${AGGREGATOR}/v1/blobs/${blobId}`);