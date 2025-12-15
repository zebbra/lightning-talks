// Simple script that exports all your ordered procucts from Galaxus to a CSV file
//
// Copy this from Google dev tools

const headers = {
  accept:
    "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,de;q=0.7,de-CH;q=0.6",
  "cache-control": "no-cache",
  "content-type": "application/json",
  pragma: "no-cache",
  priority: "u=1, i",
  "sec-ch-ua": '"Not_A Brand";v="99", "Chromium";v="142"',
  "sec-ch-ua-arch": '"arm"',
  "sec-ch-ua-bitness": '"64"',
  "sec-ch-ua-full-version": '"142.0.7444.177"',
  "sec-ch-ua-full-version-list":
    '"Not_A Brand";v="99.0.0.0", "Chromium";v="142.0.7444.177"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-model": '""',
  "sec-ch-ua-platform": '"macOS"',
  "sec-ch-ua-platform-version": '"26.1.0"',
  "sec-ch-ua-wow64": "?0",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-dg-correlation-id": "375be542-d180-4199-9aa2-3c6b0efda261",
  "x-dg-graphql-client-name": "isomorph",
  "x-dg-graphql-client-version": "master-20251205-1818-19970513524-1",
  "x-dg-language": "de-CH",
  "x-dg-portal": "22",
  "x-dg-routeowner": "doubleoseven",
  "x-dg-team": "doubleoseven",
  "x-dg-xpid": "4cc2be95",
  cookie: "<YOUR_COOKIE_HERE>",
  Referer: "https://www.galaxus.ch/de/order",
};

async function fetchOrders(after) {
  const body = {
    variables: {
      after: after,
      filterScope: null,
      first: 20,
      searchQuery: null,
    },
  };

  const resp = await fetch(
    "https://www.galaxus.ch/graphql/o/f8285c22b1ff7de98d266d55b40d7619/OrderListPaginationQuery",
    {
      headers: { ...headers, "x-dg-routename": "/order" },
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  const json = await resp.json();

  // console.dir(json, { depth: 6 });

  const orders = json.data.viewer.customerOrders.edges.map(
    (edge) => edge.node.orderId,
  );

  const pageInfo = json.data.viewer.customerOrders.pageInfo;

  return { orders, pageInfo };
}

async function fetchOrderItems(orderId) {
  const body = {
    variables: {
      customerOrderSlug: orderId.toString(),
      adventCalendarEnabled: true,
    },
  };

  const resp = await fetch(
    "https://www.galaxus.ch/graphql/o/25627bb428a8b8c7536e170f79ecd15d/orderDetailsSimplePageQuery",
    {
      headers: { ...headers, "x-dg-routename": "/order/[orderId]" },
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  const json = await resp.json();

  // console.dir(json, { depth: 4 });

  const itemGroups = json.data.customerOrderBySlug.productLineItemsGroups;

  const items = itemGroups
    .map((group) => {
      const items = group.productLineItems.nodes;

      return items.map((item) => {
        const brand = item.product.brand.name;
        const name = item.product.name;
        const quantity = item.quantity;
        const unitPrice = item.unitPrice.amountInclusive;

        return { brand, name, quantity, unitPrice };
      });
    })
    .flat();

  const orderedAt = json.data.customerOrderBySlug.createdAt;

  return { orderId, orderedAt, items };
}

async function run() {
  const fs = require("fs");
  const { format } = require("@fast-csv/format");

  const stream = format({ headers: true });
  stream.pipe(fs.createWriteStream("orders.csv"));

  let page = { endCursor: null, hasNextPage: true };

  while (page.hasNextPage) {
    const { orders, pageInfo } = await fetchOrders(page.endCursor);

    page = pageInfo;

    for (const orderId of orders) {
      console.log(`Processing order ${orderId}`);
      const { orderedAt, items } = await fetchOrderItems(orderId);

      for (const item of items) {
        console.log(item);
        stream.write({ orderId, orderedAt, ...item });
      }
    }
  }

  stream.end();
}

run().then(() => {
  console.log("Done!");
});