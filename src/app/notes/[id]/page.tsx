"use client";

import { useParams } from "next/navigation";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import useRelayStore from "@/store/relay-store";

import { NoteFeedCard } from "@/components/note/note-feed-card";

export default function NotesPage() {
  const params = useParams<{ id: string }>();
  const { subscribe, relayUrl } = useRelayStore();

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
    if (relayUrl) {
      getRootNoteEvents();
      getNoteEvents();
    }
  }, [relayUrl]);

  return (
    <div className={`space-y-8 my-12`}>
      <div>
        {rootThread.map((event) => (
          <div key={event.id} className={``}>
            <NoteFeedCard event={event} />

            <div className={`text-muted-foreground px-4`}>
              {event.tags.map((tag: string) => (
                <div key={tag}>{`${tag[0]} : ${tag[1]}`}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        {thread.map((event) => (
          <div key={event.id} className={``}>
            <NoteFeedCard event={event} />

            <div className={`text-muted-foreground px-4`}>
              {event.tags.map((tag: string) => (
                <div key={tag}>{`${tag[0]} : ${tag[1]}`}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
