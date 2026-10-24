"use client";

import "@getpara/react-sdk/styles.css";
import { Environment, ParaProvider } from "@getpara/react-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { monad, monadTestnet } from "wagmi/chains";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

const paraApiKey = process.env.NEXT_PUBLIC_PARA_API_KEY;

/**
 * Used when no Para API key is configured yet, so the app still renders and injects a browser
 * wallet instead of throwing "A Para API key is required." at startup.
 */
const injectedConfig = createConfig({
  chains: [monadTestnet, monad],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
    [monad.id]: http("https://rpc.monad.xyz"),
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  if (!paraApiKey) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={injectedConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{ apiKey: paraApiKey, env: Environment.BETA }}
        config={{ appName: "Supaboard" }}
        paraModalConfig={{
          oAuthMethods: ["GOOGLE", "APPLE", "DISCORD", "TWITTER", "FARCASTER"],
        }}
        externalWalletConfig={{
          evmConnector: {
            config: {
              // First chain is the default users land on when they connect: Monad testnet.
              chains: [monadTestnet, monad],
              transports: {
                [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
                [monad.id]: http("https://rpc.monad.xyz"),
              },
            },
          },
          wallets: ["METAMASK", "COINBASE", "WALLETCONNECT", "RAINBOW"],
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
