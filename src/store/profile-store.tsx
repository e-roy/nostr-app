import { create } from "zustand";

interface UserProfile {
  picture?: string;
  name?: string;
  nip05?: string;
}

interface ProfileStore {
  profiles: Record<string, UserProfile>;
  pendingRequests: Set<string>;
  getProfile: (pubkey: string) => UserProfile | undefined;
  setProfile: (pubkey: string, profile: UserProfile) => void;
  isPending: (pubkey: string) => boolean;
  setPending: (pubkey: string, pending: boolean) => void;
}

const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: {},
  pendingRequests: new Set(),
  getProfile: (pubkey) => get().profiles[pubkey],
  setProfile: (pubkey, profile) =>
    set((state) => ({
      profiles: { ...state.profiles, [pubkey]: profile },
    })),
  isPending: (pubkey) => get().pendingRequests.has(pubkey),
  setPending: (pubkey, pending) =>
    set((state) => {
      const newSet = new Set(state.pendingRequests);
      pending ? newSet.add(pubkey) : newSet.delete(pubkey);
      return { pendingRequests: newSet };
    }),
}));

export default useProfileStore;
