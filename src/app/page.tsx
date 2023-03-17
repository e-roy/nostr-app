"use client";

import { RelayContext } from "@/context/relay-provider";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import { Event, nip19 } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getTagValues, getTimeAndDate } from "@/utils";

import { DisplayTags, UserLink } from "@/components";

export default function Home() {
  const { subscribe, relayUrl, activeRelay } = useContext(RelayContext);

  const [events, setEvents] = useState<Event[]>([]);

  const getEvents = () => {
    let newEvents: Event[] = [];

    const filter = {
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
    if (activeRelay) getEvents();
  }, [activeRelay, relayUrl]);

  const shortenContent = (content: string) => {
    if (content.length > 120) {
      return content.slice(0, 120) + "...";
    }

    return content;
  };

  const routeCachedEvent = (pubkey: string, tags: any) => {
    const identifier = getTagValues("d", tags);

    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: pubkey,
      kind: 30023,
      relays: [relayUrl],
    };

    return nip19.naddrEncode(addressPointer);
  };

  return (
    <main className={`p-4`}>
      <div>
        {events.map((event, i) => (
          <div
            key={i}
            className={`border border-slate-300 shadow-lg rounded-md p-4 my-6 break-words`}
          >
            <div className={`flex justify-between`}>
              <Link
                href={`/post/${routeCachedEvent(event.pubkey, event.tags)}`}
                prefetch={false}
              >
                <h3
                  className={`text-slate-900 text-2xl font-semibold hover:text-primary-600`}
                >
                  {getTagValues("title", event.tags) || "Untitled"}
                </h3>
              </Link>
              <div className={`flex flex-col`}>
                <span
                  className={`my-auto pl-4 text-sm text-slate-700 font-medium`}
                >
                  {getTimeAndDate(event.created_at)}
                </span>
                <span
                  className={`my-auto pl-4 text-sm text-slate-700 font-medium`}
                >
                  {getTagValues("client", event.tags) || "unknown client"}
                </span>
              </div>
            </div>
            <div className={`flex justify-between gap-4`}>
              <div>
                <div className={`text-slate-600 my-2`}>
                  {getTagValues("summary", event.tags) || (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {shortenContent(event.content)}
                    </ReactMarkdown>
                  )}
                </div>
                <div className={`my-2`}>
                  <DisplayTags tags={event.tags} />
                </div>
                <div className={`my-2`}>
                  <UserLink pubkey={event.pubkey} />
                </div>
              </div>
              <div>
                {getTagValues("image", event.tags) && (
                  <img
                    src={getTagValues("image", event.tags)}
                    className={`w-32 h-32 object-cover rounded-md`}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
