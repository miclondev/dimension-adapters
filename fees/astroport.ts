import { CHAIN } from "../helpers/chains";

import { BaseAdapter, Adapter, FetchResult } from "../adapters/types";
import BigNumber from "bignumber.js";
import { historicalDataQuery, API_ENDPOINT } from "../dexs/astroport";
import { request } from "graphql-request";
import { getUniqStartOfTodayTimestamp } from "../helpers/getUniSubgraphVolume";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

const fetch = (chainId: string) => {
  return async (timestamp: number) => {
    const startTime = timestamp - ONE_DAY_IN_SECONDS; // 60*60*24
    const endTime = timestamp;
    const response = await request(API_ENDPOINT, historicalDataQuery, {
      startTime,
      endTime,
      chainId,
      type: "fees",
    });
    const data = response?.historicalData;
    return {
      timestamp,
      dailyFees: data?.totalCommissionUSD ? String(data?.totalCommissionUSD) : undefined,
      dailySupplySideRevenue: data?.totalMakerFeeUSD ? String(data?.totalMakerFeeUSD) : undefined,
      dailyProtocolRevenue: data?.totalMakerFeeUSD ? String(data?.totalMakerFeeUSD) : undefined,
    };
  };
};

// const methodology = {
//   UserFees:
//     "Users pay a fee per trade: 0.3% for constant product pools, 0.05% for stableswap pools.",
//   Fees: "Total fees collected from all trades on Astroport pools.",
//   Revenue:
//     "Astral Assembly's share: 1/3rd of the total fee for constant product pools (0.1%), 1/2 of the total fee for stableswap pools (0.025%).",
//   ProtocolRevenue:
//     "The Astral Assembly's revenue used to purchase ASTRO: 0.1% for constant product pools, 0.025% for stableswap pools.",
//   HoldersRevenue:
//     "Revenue from ASTRO purchases using Astral Assembly's fees, deposited into the xASTRO staking pool.",
//   SupplySideRevenue:
//     "LPs' share of fees: 2/3rds of the total for constant product pools (0.2%), 1/2 for stableswap pools (0.025%), increasing the size of the pools and the number of tokens LPs can redeem.",
// };

const methodology = {
  UserFees:
    "Users pay a fee per trade: 0.3% for constant product pools, 0.05% for stableswap pools.",
  Revenue:
    "A 0.05% (bsc and ethereum) or 0.15% (polygon and telos) of the fees goes to treasury, 50% of that fee is used to buyback and burn BANANA, on Telos 25% of the collected fees goes to Telos",
  ProtocolRevenue:
    "A 0.05% (bsc and ethereum) or 0.15% (polygon) or 0.0375% (telos) of the fees goes to treasury",
  HoldersRevenue:
    "Of all DEX trading fees earned by ApeSwap, 50% are used to buy back and burn BANANA on a quarterly basis",
  SupplySideRevenue:
    "A 0.15% (bsc and ethereum) or 0.05% (polygon and telos) is distributed proportionally to all APE-LP token holders",
};

const baseAdapter: BaseAdapter = {
  [CHAIN.TERRA]: {
    fetch: fetch("phoenix-1"),
    start: async () => 1654337809,
    meta: {
      methodology,
    },
  },
  [CHAIN.INJECTIVE]: {
    fetch: fetch("phoenix-1"),
    start: async () => 1654337809,
    meta: {
      methodology,
    },
  },
  neutron: {
    fetch: fetch("phoenix-1"),
    start: async () => 1654337809,
    meta: {
      methodology,
    },
  },
};

const adapter: Adapter = {
  adapter: baseAdapter,
};

export default adapter;
