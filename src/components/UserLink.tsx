import { nip19, Event } from "nostr-tools";
import { useEffect, useState } from "react";
import useRelayStore from "@/store/relay-store";

import Link from "next/link";

export const UserLink = ({ pubkey }: { pubkey: string }) => {
  const subscribe = useRelayStore((state) => state.subscribe);
  const relayUrl = useRelayStore((state) => state.relayUrl);
  const [userProfile, setUserProfile] = useState<any>({});

  const getProfileEvent = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [0],
      authors: [pubkey],
    };

    const onEvent = (event: Event) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      setUserProfile(JSON.parse(newEvents[0].content));
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (pubkey) getProfileEvent();
  }, [pubkey]);

  return (
    <Link href={`/user/${nip19.npubEncode(pubkey)}`}>
      <div className={`flex hover:text-primary-500 text-slate-700`}>
        {userProfile.picture && (
          <img className={`w-12 h-12 rounded-full`} src={userProfile.picture} />
        )}
        <div className={`flex flex-col ml-4  font-medium`}>
          <span>{userProfile.name}</span>
          <span>{userProfile.nip05}</span>
        </div>
      </div>
    </Link>
  );
};
