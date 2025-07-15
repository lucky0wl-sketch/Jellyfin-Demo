import { Jellyfin } from '@jellyfin/sdk';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api.js';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by.js';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order.js';
import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind.js';

async function main() {
  // Initialize the Jellyfin SDK
  const jellyfin = new Jellyfin({
    clientInfo: { name: 'MyApp', version: '1.0.0' },
    deviceInfo: { name: 'NodClient', id: 'node-client-id' },
  });

  // Connect to your Jellyfin server
  const api = jellyfin.createApi('http://192.168.0.182:8096');

  // Authenticate with username and password
  const authResp = await api.authenticateUserByName('Dummy', 'Dummy');
  const user = authResp.data.User;

  if (!user?.Id) {
    throw new Error('Authentication failed. No user ID returned.');
  }

  const userId = user.Id;

  // Get 15 most recently watched episodes
  const episodes = await getItemsApi(api).getItems({
    userId,
    includeItemTypes: [BaseItemKind.Episode, BaseItemKind.Series],
    isPlayed: true,
    recursive: true,
    sortBy: [ItemSortBy.DatePlayed],
    sortOrder: [SortOrder.Descending],
    limit: 15,
    enableUserData: true,
  });

  console.log('\nRecently watched episodes:');
  if (episodes.data.Items) {
    // console.log(episodes.data.Items)
    episodes.data.Items.forEach(item => {
      console.log(`- ${item.Name} - ${item.SeriesName}`);

    });
  } else {
    console.log('No recent episodes found.');
  }

  // Get 15 most recently watched movies
  const movies = await getItemsApi(api).getItems({
    userId,
    includeItemTypes: [BaseItemKind.Movie],
    isPlayed: true,
    recursive: true,
    sortBy: [ItemSortBy.DatePlayed],
    sortOrder: [SortOrder.Descending],
    limit: 15,
    enableUserData: true,
  });

  console.log('\nRecently watched movies:');
  if (movies.data.Items) {
    movies.data.Items.forEach(item => {
      console.log(`- ${item.Name}`);
    });
  } else {
    console.log('No recent movies found.');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
});
