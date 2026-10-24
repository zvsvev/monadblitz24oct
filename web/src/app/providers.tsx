"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider, createConfig as createPrivyConfig } from "@privy-io/wagmi";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { monad, monadTestnet } from "wagmi/chains";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const transports = {
  [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  [monad.id]: http("https://rpc.monad.xyz"),
};

/** Used when no Privy app id is configured, so the app still renders with an injected wallet. */
const injectedConfig = createConfig({
  chains: [monadTestnet, monad],
  connectors: [injected()],
  transports,
});

/** The Privy-backed config; the first chain is the default users land on when they connect. */
const privyConfig = createPrivyConfig({
  chains: [monadTestnet, monad],
  transports,
});

export default function Providers({ children }: { children: ReactNode }) {
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={injectedConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet, monad],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        appearance: { accentColor: "#836ef9" },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={privyConfig}>{children}</PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
