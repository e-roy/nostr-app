import { type Event } from "nostr-tools";
import { Card } from "@/components/ui/card";
import { PostHeader } from "./post-header";
import { PostContent } from "./post-content";
import { getTagValues } from "@/utils";
import { DisplayTags } from "../DisplayTags";

interface PostProps {
  event: Event;
}

export function Post({ event }: PostProps) {
  return (
    <Card className="p-8 rounded-none transition-colors">
      <div className="space-y-8">
        <PostHeader
          event={event}
          pubkey={event.pubkey}
          timestamp={new Date(event.created_at * 1000)}
        />
        <div>
          <h2 className="text-4xl font-bold hover:text-primary transition-colors text-center">
            {getTagValues("title", event.tags) || "Untitled"}
          </h2>
        </div>
        <div className={`px-12`}>
          <DisplayTags tags={event.tags} />
        </div>
        <div>
          {getTagValues("image", event.tags) && (
            <img
              className={`w-full rounded-sm my-6 px-12`}
              src={getTagValues("image", event.tags)}
            />
          )}
        </div>

        <PostContent content={event.content} />
      </div>
    </Card>
  );
}
