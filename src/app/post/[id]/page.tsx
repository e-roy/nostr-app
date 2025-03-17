"use client";
import { useParams } from "next/navigation";
import { nip19, Event } from "nostr-tools";
import { useEffect, useState } from "react";
import useRelayStore from "@/store/relay-store";

import { Post } from "@/components/post/post";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const { subscribe, relayUrl, initialized } = useRelayStore();
  const [event, setEvent] = useState<Event | undefined>(undefined);

  const naddr: any = nip19.decode(params.id).data;

  const getPostEvents = () => {
    // console.log("naddr   ===>", naddr);

    let pubkeysSet = new Set<string>();

    setEvent(undefined);
    let relayName = relayUrl.replace("wss://", "");

    const filter = {
      kinds: [naddr.kind],
      authors: [naddr.pubkey],
      "#d": [naddr.identifier],
    };

    let events: Event[] = [];
    const onEvent = (event: any) => {
      // @ts-ignore
      event.relayName = relayName;
      events.push(event);
      pubkeysSet.add(event.pubkey);
    };

    const onEOSE = () => {
      if (events.length > 0) {
        setEvent(events[0]);
      }
    };

    subscribe([naddr.relays[0]], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (relayUrl) {
      getPostEvents();
    }
  }, [relayUrl]);

  return <div className={`my-12`}>{event && <Post event={event} />}</div>;
}
