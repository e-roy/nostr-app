"use client";

import { RelayContext } from "@/context/relay-provider";
import { nip19 } from "nostr-tools";
import { useContext, useEffect, useState } from "react";
import { getTimeAndDate } from "@/utils";
import { UserLink } from "@/components";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NotesPage({ params }: { params: { id: string } }) {
  const { activeRelay, relayUrl, subscribe } = useContext(RelayContext);

  const [rootThread, setRootThread] = useState<any[]>([]);
  const [thread, setThread] = useState<any[]>([]);

  const convertKey = nip19.decode(params.id).data.toString();

  const getRootNoteEvents = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [1],
      ids: [convertKey],
      //   "#e": [convertKey],
    };

    const onEvent = (event: any) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length !== 0) {
        setRootThread((prev) => [...prev, ...newEvents]);
      }

      console.log("convertKey", convertKey);
      console.log("onEOSE getRootNoteEvents 1", newEvents);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  const getNoteEvents = () => {
    const newEvents: any[] = [];

    const filter = {
      kinds: [1],
      "#e": [convertKey],
    };

    const onEvent = (event: any) => {
      newEvents.push(event);
    };

    const onEOSE = () => {
      if (newEvents.length !== 0) {
        setThread((prev) => [...prev, ...newEvents]);
      }

      console.log("onEOSE events 1", newEvents);
    };

    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (activeRelay) {
      getRootNoteEvents();
      getNoteEvents();
    }
  }, [activeRelay, relayUrl]);

  return (
    <main className={`p-4`}>
      <div>
        {rootThread.map((event) => (
          <div key={event.id} className={`border p-4`}>
            <div className={`flex justify-between`}>
              <UserLink pubkey={event.pubkey} />
              <span
                className={`my-auto pl-4 text-sm text-slate-700 font-medium`}
              >
                {getTimeAndDate(event.created_at)}
              </span>
            </div>
            <div className={`text-slate-600 my-2`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {event.content}
              </ReactMarkdown>
            </div>
            <div>
              {event.tags.map((tag: string) => (
                <div key={tag}>{`${tag[0]} : ${tag[1]}`}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        {thread.map((event) => (
          <div key={event.id} className={`border p-4`}>
            <div className={`flex justify-between`}>
              <UserLink pubkey={event.pubkey} />
              <span
                className={`my-auto pl-4 text-sm text-slate-700 font-medium`}
              >
                {getTimeAndDate(event.created_at)}
              </span>
            </div>
            <div className={`text-slate-600 my-2`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {event.content}
              </ReactMarkdown>
            </div>
            <div>
              {event.tags.map((tag: string) => (
                <div key={tag}>{`${tag[0]} : ${tag[1]}`}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
