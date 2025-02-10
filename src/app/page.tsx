"use client";

import { useEffect, useState } from "react";
import type { Filter, Event } from "nostr-tools";
import useRelayStore from "@/store/relay-store";
import { PostFeedCard } from "@/components/post/post-feed-card";

export default function Home() {
  const subscribe = useRelayStore((state) => state.subscribe);
  const relayUrl = useRelayStore((state) => state.relayUrl);

  const [events, setEvents] = useState<Event[]>([]);

  const getEvents = () => {
    let newEvents: Event[] = [];

    const filter: Filter = {
      kinds: [30023],
      limit: 20,
    };

    const onEvent = (event: Event) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length > 0) {
        setEvents((prev) => [...prev, ...newEvents]);
      }
      console.log("onEOSE", newEvents);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (relayUrl) getEvents();
  }, [relayUrl]);

  return (
    <div className={`space-y-4 my-12`}>
      {events.map((event) => (
        <PostFeedCard key={event.id} event={event} />
      ))}
    </div>
  );
}
