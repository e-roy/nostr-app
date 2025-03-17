"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RELAYS } from "@/lib/constants";
import { Relay } from "nostr-tools";
import type { Event, Filter, Relay as RelayType } from "nostr-tools";
import { Subscription } from "nostr-tools/lib/types/relay";

// Define relay status type
interface RelayStatus {
  url: string;
  status: "connected" | "connecting" | "disconnected" | "failed";
  lastConnected?: number;
}

// Define the shape of our Relay store
interface RelayStore {
  initialized: boolean;
  allRelays: string[];
  relayUrl: string;
  activeRelay: RelayType | undefined;
  connectedRelays: Set<RelayType>;
  relayStatuses: Record<string, RelayStatus>;

  // Setters
  setInitialized: (initialized: boolean) => void;
  setAllRelays: (relays: string[]) => void;
  setRelayUrl: (url: string) => void;
  setActiveRelay: (relay: RelayType | undefined) => void;
  setConnectedRelays: (relays: Set<RelayType>) => void;
  setRelayStatus: (url: string, status: RelayStatus["status"]) => void;

  // Utility Actions
  addRelay: (relay?: string) => void;
  removeRelay: (relay: string) => void;
  resetRelays: () => void;
  connect: (newRelayUrl: string) => Promise<RelayType | undefined>;
  checkRelayHealth: (url: string) => Promise<boolean>;
  reconnectToRelay: (
    url: string,
    attempt?: number
  ) => Promise<RelayType | undefined>;
  reconnectToSavedRelays: () => void;
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
  ) => Promise<(() => void) | void>;
}

// Check if we're in a browser environment
const isClient = typeof window !== "undefined";

// Try to get persisted relays from localStorage before initializing the store
let initialRelays = RELAYS;
let initialRelayUrl = RELAYS[0];
let initialRelayStatuses = {};

if (isClient) {
  try {
    const storedData = localStorage.getItem("nostr-relay-storage");
    if (storedData) {
      const { state } = JSON.parse(storedData);
      if (state.allRelays && Array.isArray(state.allRelays)) {
        initialRelays = state.allRelays;
      }
      if (state.relayUrl) {
        initialRelayUrl = state.relayUrl;
      }
      if (state.relayStatuses) {
        initialRelayStatuses = state.relayStatuses;
      }
    }
  } catch (e) {
    console.warn("Failed to load persisted relay data:", e);
  }
}

// Create zustand store with persistence
const useRelayStore = create<RelayStore>()(
  persist(
    (set, get) => ({
      initialized: false,
      allRelays: initialRelays,
      relayUrl: initialRelayUrl,
      activeRelay: undefined,
      connectedRelays: new Set(),
      relayStatuses: initialRelayStatuses,

      // Setters
      setInitialized: (initialized) => set({ initialized }),
      setAllRelays: (relays) => set({ allRelays: relays }),
      setRelayUrl: (url) => set({ relayUrl: url }),
      setActiveRelay: (relay) => set({ activeRelay: relay }),
      setConnectedRelays: (relays) => set({ connectedRelays: relays }),
      setRelayStatus: (url, status) =>
        set((state) => ({
          relayStatuses: {
            ...state.relayStatuses,
            [url]: {
              url,
              status,
              lastConnected:
                status === "connected"
                  ? Date.now()
                  : state.relayStatuses[url]?.lastConnected,
            },
          },
        })),

      // Utility Actions
      addRelay: (relay) => {
        if (!relay) return;
        const trimmed = relay.trim();
        const current = get().allRelays;
        if (!current.includes(trimmed)) {
          set({ allRelays: [...current, trimmed] });
          // Try to connect to the new relay
          get().connect(trimmed);
        }
      },

      removeRelay: (relay) => {
        const updated = get().allRelays.filter((r) => r !== relay);
        set({ allRelays: updated });

        // Close connection if it exists
        const { connectedRelays, setConnectedRelays } = get();
        const existingRelay = Array.from(connectedRelays).find(
          (r) => r.url === relay
        );
        if (existingRelay) {
          existingRelay.close();
          const newSet = new Set(
            Array.from(connectedRelays).filter((r) => r.url !== relay)
          );
          setConnectedRelays(newSet);
        }
      },

      resetRelays: () => {
        // Close all existing connections
        const { connectedRelays } = get();
        Array.from(connectedRelays).forEach((relay) => relay.close());

        // Reset to default relays
        set({
          allRelays: RELAYS,
          connectedRelays: new Set(),
          relayStatuses: {},
        });

        // Reconnect to default relays
        get().reconnectToSavedRelays();
      },

      connect: async (newRelayUrl: string): Promise<RelayType | undefined> => {
        if (!newRelayUrl) return undefined;

        const {
          connectedRelays,
          setActiveRelay,
          setConnectedRelays,
          setRelayStatus,
        } = get();

        // Check if we already have a connected relay
        const existingRelay = Array.from(connectedRelays).find(
          (r) => r.url === newRelayUrl
        );

        if (existingRelay) {
          setActiveRelay(existingRelay);
          return existingRelay;
        }

        setRelayStatus(newRelayUrl, "connecting");

        try {
          // Add a timeout to the connection attempt
          const connectWithTimeout = async () => {
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(
                () => reject(new Error("Connection timed out")),
                10000
              ); // 10 second timeout
            });

            const connectionPromise = Relay.connect(newRelayUrl);
            return Promise.race([connectionPromise, timeoutPromise]);
          };

          const relay = await connectWithTimeout();

          // Subscribe to events; update active and connected relays appropriately
          relay.subscribe([], {
            onevent: () => {
              if (newRelayUrl === relay.url) {
                setActiveRelay(relay);
                setConnectedRelays(
                  new Set([...Array.from(connectedRelays), relay])
                );
                setRelayStatus(newRelayUrl, "connected");
              }
            },
            onclose: () => {
              const newSet = new Set(
                Array.from(get().connectedRelays).filter(
                  (r) => r.url !== relay.url
                )
              );
              setConnectedRelays(newSet);
              setRelayStatus(newRelayUrl, "disconnected");
            },
          });

          return relay;
        } catch (error) {
          console.warn(`Failed to connect to relay ${newRelayUrl}:`, error);
          setRelayStatus(newRelayUrl, "failed");
          return undefined;
        }
      },

      checkRelayHealth: async (url: string): Promise<boolean> => {
        try {
          const relay = await Relay.connect(url);
          // Try a simple subscription to test if the relay is responsive
          const sub = relay.subscribe([{ kinds: [0], limit: 1 }], {
            oneose: () => {
              sub.close();
              relay.close();
            },
            onevent: () => {
              sub.close();
              relay.close();
            },
          });

          // Wait a short time for response
          await new Promise((resolve) => setTimeout(resolve, 3000));
          relay.close();
          return true;
        } catch (error) {
          console.warn(`Relay ${url} is not healthy:`, error);
          return false;
        }
      },

      reconnectToRelay: async (
        url: string,
        attempt = 1
      ): Promise<RelayType | undefined> => {
        const { connect, setRelayStatus } = get();

        setRelayStatus(url, "connecting");

        try {
          const relay = await connect(url);
          if (relay) {
            setRelayStatus(url, "connected");
            return relay;
          } else {
            throw new Error("Connection failed");
          }
        } catch (error) {
          setRelayStatus(url, "failed");

          // Exponential backoff with max of 5 minutes
          const delay = Math.min(1000 * Math.pow(2, attempt), 300000);

          console.log(
            `Reconnecting to ${url} in ${
              delay / 1000
            } seconds (attempt ${attempt})`
          );

          setTimeout(() => {
            if (get().allRelays.includes(url)) {
              get().reconnectToRelay(url, attempt + 1);
            }
          }, delay);

          return undefined;
        }
      },

      reconnectToSavedRelays: () => {
        const { allRelays, reconnectToRelay, setInitialized } = get();

        // Mark as initialized to prevent flashing of default relays
        setInitialized(true);

        allRelays.forEach((url) => {
          reconnectToRelay(url).catch((err) =>
            console.error(`Failed to reconnect to ${url}:`, err)
          );
        });
      },

      publish: async (
        relays: string[],
        event: Event,
        onOk: () => void,
        onSeen: (url: string) => void,
        onFailed: (url: string) => void
      ) => {
        const { connect } = get();
        let publishedToAtLeastOne = false;

        await Promise.all(
          relays.map(async (url) => {
            try {
              const relay = await connect(url);
              if (!relay) {
                onFailed(url);
                return;
              }

              await relay.publish(event);
              console.log(`${url} has accepted our event`);
              onSeen(url);
              publishedToAtLeastOne = true;
            } catch (error) {
              console.log(`failed to publish to ${url}:`, error);
              onFailed(url);
            }
          })
        );

        if (publishedToAtLeastOne) {
          onOk();
        }
      },

      subscribe: async (
        relays: string[],
        filter: Filter,
        onEvent: (event: Event) => void,
        onEOSE: () => void
      ) => {
        const { connect } = get();
        let successfulSubscriptions = 0;
        const activeSubscriptions: Subscription[] = [];

        await Promise.all(
          relays.map(async (url) => {
            try {
              const relay = await connect(url);
              if (!relay) return;

              const sub = relay.subscribe([filter], {
                onevent: (event: Event) => {
                  onEvent(event);
                },
                oneose: () => {
                  successfulSubscriptions++;
                  if (successfulSubscriptions === relays.length) {
                    onEOSE();
                  }
                },
                onclose: () => {
                  console.log(`Subscription to ${url} closed`);
                },
              });

              activeSubscriptions.push(sub);

              // Add a timeout to close subscriptions that never receive EOSE
              setTimeout(() => {
                // Check if the subscription still exists and hasn't been closed
                try {
                  sub.close();
                } catch (e) {
                  console.log(`Subscription to ${url} already closed`);
                }
              }, 30000); // 30 second timeout
            } catch (error) {
              console.warn(`Failed to subscribe to ${url}:`, error);
            }
          })
        );

        // If we couldn't connect to any relays, still call onEOSE
        if (successfulSubscriptions === 0) {
          onEOSE();
        }

        return () => {
          // Cleanup function to close all subscriptions
          activeSubscriptions.forEach((sub) => {
            try {
              sub.close();
            } catch (e) {
              // Subscription might already be closed
            }
          });
        };
      },
    }),
    {
      name: "nostr-relay-storage", // unique name for localStorage key
      storage: createJSONStorage(() =>
        isClient
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => null,
              removeItem: () => null,
            }
      ),
      // Only persist these fields
      partialize: (state) => ({
        allRelays: state.allRelays,
        relayUrl: state.relayUrl,
        relayStatuses: state.relayStatuses,
      }),
    }
  )
);

// Initialize connections when the store is first used on the client side
if (isClient) {
  // Use setTimeout to ensure this runs after hydration
  setTimeout(() => {
    useRelayStore.getState().reconnectToSavedRelays();
  }, 0);
}

export default useRelayStore;
