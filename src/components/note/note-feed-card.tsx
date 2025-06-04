"use client";

import { type Event, nip19 } from "nostr-tools";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PostHeader } from "../post/post-header";
import { PostContent } from "../post/post-content";
import { getTagValues } from "@/utils";

const shortenContent = (content: string): string => {
  return content.length > 120 ? `${content.slice(0, 120)}...` : content;
};

interface NoteFeedCardProps {
  event: Event;
}

export const NoteFeedCard = ({ event }: NoteFeedCardProps) => {
  const router = useRouter();

  const summary =
    getTagValues("summary", event.tags) || shortenContent(event.content);

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <PostHeader
            event={event}
            pubkey={event.pubkey}
            timestamp={new Date(event.created_at * 1000)}
          />

          <div
            className={`cursor-pointer hover:underline`}
            onClick={() => router.push(`/notes/${nip19.noteEncode(event.id)}`)}
          >
            <PostContent content={summary} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
