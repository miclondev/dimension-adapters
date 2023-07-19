import { CHAIN } from "../helpers/chains";
import { BaseAdapter, Adapter } from "../adapters/types";
import { API_ENDPOINT } from "../dexs/astroport";
import { request } from "graphql-request";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const historicalDataQuery = `
  query Query($chainId: String!, $startTime: Int, $endTime: Int, $type: String) {
    historicalData(chainId: $chainId, startTime: $startTime, endTime: $endTime, type: $type){
      totalCommissionUSD
      totalLpFeesUSD
      totalMakerFeeUSD
    }
  }
`;

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
      dailyFees: data?.totalCommissionUSD || undefined,
      dailyRevenue: data?.totalCommissionUSD || undefined,
      dailyUserFees: data?.totalCommissionUSD || undefined,
      dailySupplySideRevenue: data?.totalLpFeesUSD || undefined,
      dailyHoldersRevenue: data?.totalMakerFeeUSD || undefined,
    };
  };
};

const methodology = {
  UserFees:
    "Traders incur a fee per transaction on Astroport: 0.3% for constant product pools and 0.05% for stableswap pools.",
  Fees: "Astroport enforces a fee structure per transaction where 2/3rd of the total fee is awarded to liquidity providers, and the remaining 1/3rd goes to the Astral Assembly for governing purposes.",
  HoldersRevenue:
    "Astroport directs a third of all its DEX trading fees to the Astral Assembly, which are then used to purchase ASTRO from ASTRO liquidity pools. These purchased ASTRO are added to the xASTRO staking pool.",
  SupplySideRevenue:
    "Two-thirds of all DEX trading fees generated on Astroport are allocated to the liquidity providers.",
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
    fetch: fetch("injective-1"),
    start: async () => 1654337809,
    meta: {
      methodology,
    },
  },
  neutron: {
    fetch: fetch("neutron-1"),
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
