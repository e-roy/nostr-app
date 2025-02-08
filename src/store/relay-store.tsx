"use client";

import { create } from "zustand";
import { RELAYS } from "@/lib/constants";
import { Relay } from "nostr-tools";
import type { Event, Filter, Relay as RelayType } from "nostr-tools";

// Define the shape of our Relay state
interface RelayStore {
  allRelays: string[];
  relayUrl: string;
  activeRelay: RelayType | undefined;
  connectedRelays: Set<RelayType>;

  // Setters
  setAllRelays: (relays: string[]) => void;
  setRelayUrl: (url: string) => void;
  setActiveRelay: (relay: RelayType | undefined) => void;
  setConnectedRelays: (relays: Set<RelayType>) => void;

  // Utility Actions
  addRelay: (relay?: string) => void;
  removeRelay: (relay: string) => void;
  resetRelays: () => void;
  connect: (newRelayUrl: string) => Promise<RelayType | undefined>;
  publish: (
    relays: string[],
    event: Event,
    onOk: () => void,
    onSeen: (url: string) => void,
    onFailed: (url: string) => void
  ) => Promise<void>;
  subscribe: (
    relays: string[],
    filter: Filter,
    onEvent: (event: Event) => void,
    onEOSE: () => void
  ) => Promise<void>;
}

// Create zustand store
const useRelayStore = create<RelayStore>((set, get) => ({
  allRelays: RELAYS,
  relayUrl: RELAYS[0],
  activeRelay: undefined,
  connectedRelays: new Set(),

  // Setters
  setAllRelays: (relays) => set({ allRelays: relays }),
  setRelayUrl: (url) => set({ relayUrl: url }),
  setActiveRelay: (relay) => set({ activeRelay: relay }),
  setConnectedRelays: (relays) => set({ connectedRelays: relays }),

  // Utility Actions
  addRelay: (relay) => {
    if (!relay) return;
    const trimmed = relay.trim();
    const current = get().allRelays;
    if (!current.includes(trimmed)) {
      set({ allRelays: [...current, trimmed] });
    }
  },

  removeRelay: (relay) => {
    const updated = get().allRelays.filter((r) => r !== relay);
    set({ allRelays: updated });
  },

  resetRelays: () => set({ allRelays: RELAYS }),

  connect: async (newRelayUrl: string): Promise<RelayType | undefined> => {
    if (!newRelayUrl) return undefined;
    let relay: RelayType;
    const { connectedRelays, setActiveRelay, setConnectedRelays } = get();

    // Check if we already have a connected relay
    const existingRelay = Array.from(connectedRelays).find(
      (r) => r.url === newRelayUrl
    );

    if (existingRelay) {
      relay = existingRelay;
      setActiveRelay(relay);
    } else {
      relay = await Relay.connect(newRelayUrl);
      // Subscribe to events; update active and connected relays appropriately
      relay.subscribe([], {
        onevent: () => {
          if (newRelayUrl === relay.url) {
            setActiveRelay(relay);
            setConnectedRelays(
              new Set([...Array.from(connectedRelays), relay])
            );
          }
        },
        onclose: () => {
          const newSet = new Set(
            Array.from(get().connectedRelays).filter((r) => r.url !== relay.url)
          );
          setConnectedRelays(newSet);
        },
      });
    }

    return relay;
  },

  publish: async (relays, event, onOk, onSeen, onFailed) => {
    const { connect } = get();
    for (const url of relays) {
      const relay = await connect(url);
      if (!relay) continue;
      try {
        await relay.publish(event);
        console.log(`${url} has accepted our event`);
        onSeen(url);
        onOk();
      } catch (error) {
        console.log(`failed to publish to ${url}: ${error}`);
        onFailed(url);
      }
    }
  },

  subscribe: async (relays, filter, onEvent, onEOSE) => {
    const { connect } = get();
    for (const url of relays) {
      const relay = await connect(url);
      if (!relay) continue;
      const sub = relay.subscribe([filter], {
        onevent: (event: Event) => {
          onEvent(event);
        },
        oneose: () => {
          sub.close();
          onEOSE();
        },
      });
    }
  },
}));

export default useRelayStore;
