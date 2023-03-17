"use client";

import { RelayContext } from "@/context/relay-provider";
import { nip19, Event } from "nostr-tools";
import { useContext, useEffect, useState } from "react";
import { getTagValues, getTimeAndDate } from "@/utils";

import { DisplayTags, UserLink } from "@/components";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PostPage({ params }: { params: { id: string } }) {
  const { activeRelay, relayUrl, subscribe } = useContext(RelayContext);
  const [event, setEvent] = useState<Event>();

  const naddr: any = nip19.decode(params.id).data;

  const getPostEvents = () => {
    // console.log("naddr", naddr);

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
      if (pubkeysSet.size > 0) {
        // console.log("pubkeysSet", Array.from(pubkeysSet)[0]);
      }
      // console.log("onEvent", "onEOSE", events);
    };

    subscribe([naddr.relays[0]], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (activeRelay) {
      getPostEvents();
    }
  }, [activeRelay, relayUrl]);

  return (
    <>
      {event && (
        <div className={`p-6 rounded border shadow m-6`}>
          <div className={`flex justify-between`}>
            <UserLink pubkey={event.pubkey} />

            <div>
              <span
                className={`my-auto pl-4 text-sm text-slate-700 font-medium`}
              >
                {getTagValues("client", event.tags) || "unknown client"}
              </span>
              <span
                className={`my-auto pl-4 text-sm text-slate-700 font-medium`}
              >
                - {getTimeAndDate(event.created_at)}
              </span>
            </div>
          </div>
          <div
            className={`text-4xl font-semibold text-slate-800 my-6 text-center`}
          >
            {getTagValues("title", event.tags) || "no title"}
          </div>
          <DisplayTags tags={event.tags} />
          <img
            className={`w-full rounded my-6 px-12`}
            src={getTagValues("image", event.tags)}
          />
          <div className="w-full self-center max-w-[70rem] my-16">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {event.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
}
