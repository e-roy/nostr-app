"use client";

import { type Event } from "nostr-tools";
import { nip19 } from "nostr-tools";

import { Card } from "@/components/ui/card";
import { PostHeader } from "./post-header";
import { PostContent } from "./post-content";
import { getTagValues } from "@/utils";
import { DisplayTags } from "../DisplayTags";
import useRelayStore from "@/store/relay-store";

interface AddressPointer {
  identifier: string;
  pubkey: string;
  kind: number;
  relays: string[];
}

const shortenContent = (content: string): string => {
  return content.length > 120 ? `${content.slice(0, 120)}...` : content;
};

interface PostFeedCardProps {
  event: Event;
}

export function PostFeedCard({ event }: PostFeedCardProps) {
  const relayUrl = useRelayStore((state) => state.relayUrl);

  const routeCachedEvent = (pubkey: string, tags: any): string => {
    const identifier = getTagValues("d", tags);
    const addressPointer: AddressPointer = {
      identifier,
      pubkey,
      kind: 30023,
      relays: [relayUrl],
    };
    return nip19.naddrEncode(addressPointer);
  };

  const title = getTagValues("title", event.tags) || "Untitled";
  const summary =
    getTagValues("summary", event.tags) || shortenContent(event.content);
  const imageUrl = getTagValues("image", event.tags);

  return (
    <Card className="p-4 border-x-0 transition-colors">
      <div className="space-y-4">
        <PostHeader
          event={event}
          pubkey={event.pubkey}
          timestamp={new Date(event.created_at * 1000)}
        />

        <div>
          <a href={`/post/${routeCachedEvent(event.pubkey, event.tags)}`}>
            <h2 className="text-2xl font-bold hover:text-primary transition-colors cursor-pointer hover:underline">
              {title}
            </h2>
          </a>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-4">
            <PostContent content={summary} />
            <DisplayTags tags={event.tags} />
          </div>
          {imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
