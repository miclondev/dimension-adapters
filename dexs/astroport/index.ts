import { FetchResult, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";
import { request } from "graphql-request";

export const API_ENDPOINT = "https://multichain-api.astroport.fi/graphql";

export const historicalDataQuery = `
  query Query($chainId: String!, $startTime: Int, $endTime: Int, $type: String) {
    historicalData(chainId: $chainId, startTime: $startTime, endTime: $endTime, type: $type){
      totalVolume
    }
  }
`;

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const fetch = (chainId: string) => {
  return async (timestamp: number): Promise<FetchResult> => {
    const startTime = timestamp - ONE_DAY_IN_SECONDS; // 60*60*24
    const endTime = timestamp;
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
    const response = await request(API_ENDPOINT, historicalDataQuery, {
      startTime,
      endTime,
      chainId,
      type: "volume",
    });
    const data = response?.historicalData;
    return {
      timestamp: dayTimestamp,
      dailyVolume: data?.totalVolume || undefined,
    };
  };
};

const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.TERRA]: {
      fetch: fetch("phoenix-1"),
      start: async () => 1654337809,
    },
    [CHAIN.INJECTIVE]: {
      fetch: fetch("injective-1"),
      start: async () => 1677959682,
    },
    neutron: {
      fetch: fetch("neutron-1"),
      start: async () => 1685960181,
    },
  },
};

export default adapter;
